from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from typing import Optional
from jose import JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
from pydantic import BaseModel
import hashlib
import os
import json
import logging
from collections import OrderedDict
from pathlib import Path
from threading import Lock
from time import monotonic
from uuid import uuid4
from urllib.parse import urlsplit

from sqlalchemy import distinct, func, select
from fastapi.middleware.gzip import GZipMiddleware
from backend.cache import SnapshotCache
from backend.background import submit_broadcast

from fastapi.middleware.cors import CORSMiddleware
from backend.database import (
    PRODUCTION, Application, Drive, OpportunityAlertSent, SessionLocal, StoredUpload, User,
    create_drive, create_user, get_user, get_user_by_email, init_db, list_drives, list_users,
    login_record, marksheet_filenames, refresh_profile_eligibility, update_password,
    update_profile, user_dict,
)
from backend.email_service import send_welcome_email, send_test_email_sync, get_config_status, send_reset_password_email, send_opportunity_alert_email, send_partner_welcome_email
from backend.models import SignupPayload, CreateStudentPayload, SetPasswordPayload, TestEmailPayload, CreatePartnerPayload
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse
from backend.access_token import create_access_token, get_current_user_from_token, decode_token as decode_password_token, decode_access_token as decode_token, create_set_password_token, create_reset_password_token

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

logger = logging.getLogger("alignnova")
drive_cache = SnapshotCache(ttl=30)
stats_cache = SnapshotCache(ttl=15)
auth_limits = OrderedDict()
auth_limits_lock = Lock()
AUTH_LIMITS = {
    "/api/login": 30,
    "/api/signup": 8,
    "/api/set-password": 15,
    "/api/forgot-password": 8,
    "/api/request-activation": 8,
}


class BuildAssets(StaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code in (200, 304):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response


app = FastAPI(
    title="AlignNova",
    docs_url=None if PRODUCTION else "/docs",
    redoc_url=None if PRODUCTION else "/redoc",
    openapi_url=None if PRODUCTION else "/openapi.json",
)
main = app
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app.add_middleware(GZipMiddleware, minimum_size=1024, compresslevel=4)

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
if origins:
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])


@app.middleware("http")
async def response_headers(request, call_next):
    path = request.url.path.rstrip("/")
    if PRODUCTION and request.method == "POST" and path in AUTH_LIMITS and auth_rate_limited(request, path):
        response = JSONResponse({"detail": "too_many_requests"}, status_code=429, headers={"Retry-After": "60"})
    elif path in {"/api/profile/resume", "/api/profile/marksheet"} and upload_body_too_large(request):
        response = JSONResponse({"detail": "file_too_large"}, status_code=413)
    else:
        response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    if request.url.path.startswith("/api/"):
        response.headers.setdefault("Cache-Control", "private, no-store")
    return response


def auth_rate_limited(request, path):
    client = request.client.host if request.client else "unknown"
    key = (client, path)
    now = monotonic()
    with auth_limits_lock:
        until, count = auth_limits.get(key, (now + 60, 0))
        if now >= until:
            until, count = now + 60, 0
        if count >= AUTH_LIMITS[path]:
            return True
        auth_limits[key] = (until, count + 1)
        auth_limits.move_to_end(key)
        if len(auth_limits) > 4096:
            auth_limits.popitem(last=False)
    return False


def upload_body_too_large(request):
    try:
        return int(request.headers.get("content-length", "0")) > MAX_UPLOAD_BYTES + 64 * 1024
    except ValueError:
        return True


def email_base_url(request):
    configured = os.getenv("APP_BASE_URL") or os.getenv("RENDER_EXTERNAL_URL")
    if configured:
        return configured.rstrip("/")
    return str(request.base_url).rstrip("/")


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend_dist")

# Serve React static assets (JS/CSS/images) — only if the build exists
_dist_assets = os.path.join(FRONTEND_DIST, "assets")
if os.path.isdir(_dist_assets):
    app.mount("/assets", BuildAssets(directory=_dist_assets), name="assets")


@app.on_event("startup")
def on_startup():
    if PRODUCTION:
        if len(SECRET_KEY) < 32 or SECRET_KEY == "your-secret-key-change-this":
            raise RuntimeError("Set a strong SECRET_KEY in production")
        origin = os.getenv("APP_BASE_URL") or os.getenv("RENDER_EXTERNAL_URL", "")
        if urlsplit(origin).scheme != "https" or not urlsplit(origin).hostname:
            raise RuntimeError("Production needs an HTTPS APP_BASE_URL or RENDER_EXTERNAL_URL")
        if not os.path.isfile(os.path.join(FRONTEND_DIST, "index.html")):
            raise RuntimeError("Production frontend build is missing")

    init_db()
    if not PRODUCTION and not get_user("admin"):
        create_user("admin", hash_password("adminpass"), role="admin", full_name="Administrator", email="admin@demo.local")


@app.get("/healthz", include_in_schema=False)
def health():
    # Startup has verified the schema. Frequent probes should not wake Neon.
    return {"status": "ok"}


def hash_password(password: str) -> str:
    password = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return pwd_context.verify(plain_password, hashed_password)

def get_current_user(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="missing_authorization")

    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid_authorization")

    return get_current_user_from_token(parts[1])

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = login_record(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="invalid_credentials")
    if PRODUCTION and user.role == "admin" and form_data.password == "adminpass":
        raise HTTPException(status_code=401, detail="invalid_credentials")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@app.post('/api/signup')
def signup(data: SignupPayload):
    if PRODUCTION and os.getenv("ALLOW_PUBLIC_SIGNUP") != "true":
        raise HTTPException(403, detail="invitation_required")
    existing = get_user(data.username)
    if existing:
        raise HTTPException(status_code=400, detail='username_taken')
    if data.email and get_user_by_email(data.email):
        raise HTTPException(status_code=400, detail='email_taken')
    hashed = hash_password(data.password)
    try:
        user = create_user(data.username, hashed, role="student", full_name=data.full_name, email=data.email, phone=data.phone, enrollment_id=data.enrollment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail='username_taken')
    stats_cache.invalidate()
    token = create_access_token({'sub': user['username'], 'role': user.get('role')})
    return {'access_token': token, 'token_type': 'bearer', 'role': user.get('role')}


@app.get("/api/me")
def me(request: Request, authorization: Optional[str] = None):
    # Accept Authorization header like: Bearer <token>
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="missing_authorization")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid_authorization")
    token = parts[1]
    user = get_current_user_from_token(token)
    return user.model_dump()


@app.get("/api/profile")
def get_profile(user = Depends(get_current_user)):
    return user.model_dump()


@app.post('/api/profile')
def post_profile(request: Request, payload: dict):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        username = payload_token.get('sub')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    updated = update_profile(
        username,
        full_name=payload.get('full_name'),
        email=payload.get('email'),
        phone=payload.get('phone'),
        enrollment_id=payload.get('enrollment_id'),
        course=payload.get('course'),
        location=payload.get('location'),
        linkedin_url=payload.get('linkedin_url'),
        website_url=payload.get('website_url'),
        headline=payload.get('headline'),
        bio=payload.get('bio'),
        education=payload.get('education'),
        experience=payload.get('experience'),
        profile_image=payload.get('profile_image'),
        resume_name=payload.get('resume_name'),
        resume_url=payload.get('resume_url'),
        is_eligible=payload.get('is_eligible'),
        skills=payload.get('skills'),
        languages=payload.get('languages'),
        projects=payload.get('projects'),
        uni_performance=payload.get('uni_performance')
    )
    if not updated:
        raise HTTPException(status_code=404, detail='user_not_found')
    if "profile_image" in payload and payload_token.get("role") == "hr":
        drive_cache.invalidate()
    updated.pop("hashed_password", None)
    return updated


from fastapi import UploadFile, File
from fastapi.responses import Response

MAX_UPLOAD_BYTES = 2 * 1024 * 1024
UPLOAD_TYPES = {
    ".pdf": ("application/pdf", b"%PDF-"),
    ".jpg": ("image/jpeg", b"\xff\xd8\xff"),
    ".jpeg": ("image/jpeg", b"\xff\xd8\xff"),
    ".png": ("image/png", b"\x89PNG\r\n\x1a\n"),
}


def request_identity(request):
    identity = get_user_from_auth_header(request)
    if not identity:
        raise HTTPException(401, detail="invalid_authorization")
    return identity


def save_upload(request, file, *, resume=False):
    identity = request_identity(request)
    if identity["role"] != "student":
        raise HTTPException(403, detail="student_required")
    original_name = (file.filename or "").replace("\\", "/").rsplit("/", 1)[-1][:255]
    extension = Path(original_name).suffix.lower()
    file_type = UPLOAD_TYPES.get(extension)
    if not file_type or (resume and extension != ".pdf"):
        raise HTTPException(400, detail="only_pdf_allowed" if resume else "only_pdf_and_images_allowed")
    content = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, detail="file_too_large")
    media_type, signature = file_type
    if not content.startswith(signature):
        raise HTTPException(400, detail="invalid_file_contents")

    filename = f"{uuid4().hex}{extension}"
    url = f"/api/uploads/{filename}"
    with SessionLocal.begin() as db:
        user = db.query(User).filter_by(username=identity["sub"], role="student").with_for_update().first()
        if not user:
            raise HTTPException(401, detail="user_not_found")
        existing = db.query(StoredUpload).filter_by(owner_id=user.id)
        if resume:
            if user.resume_url and user.resume_url.startswith("/api/uploads/"):
                existing.filter_by(filename=user.resume_url.rsplit("/", 1)[-1]).delete()
        used_bytes = existing.with_entities(func.coalesce(func.sum(func.length(StoredUpload.content)), 0)).scalar()
        if used_bytes + len(content) > 20 * 1024 * 1024:
            raise HTTPException(413, detail="document_quota_exceeded")
        db.add(StoredUpload(filename=filename, owner_id=user.id, media_type=media_type, content=content))
        if resume:
            user.resume_name = original_name
            user.resume_url = url
            refresh_profile_eligibility(user)
            result = user_dict(user)
            result.pop("hashed_password", None)
            return result
    return {"filename": original_name, "url": url}


@app.post("/api/profile/resume")
def upload_resume(request: Request, file: UploadFile = File(...)):
    return save_upload(request, file, resume=True)


@app.post("/api/profile/marksheet")
def upload_marksheet(request: Request, file: UploadFile = File(...)):
    return save_upload(request, file)


@app.get("/api/uploads/{filename}")
def get_uploaded_file(filename: str, request: Request):
    identity = request_identity(request)
    with SessionLocal() as db:
        owned = db.query(StoredUpload.media_type, StoredUpload.content).join(
            User, User.id == StoredUpload.owner_id
        ).filter(User.username == identity["sub"], StoredUpload.filename == filename).first()
        if owned:
            return Response(owned.content, media_type=owned.media_type)
        user = db.query(User.resume_url, User.uni_performance).filter_by(username=identity["sub"]).first()

    if user:
        if f"/api/uploads/{filename}" == user.resume_url or filename in marksheet_filenames(user.uni_performance):
            root = Path(BASE_DIR, "uploads").resolve()
            path = (root / filename).resolve()
            file_type = UPLOAD_TYPES.get(path.suffix.lower())
            if path.parent == root and file_type and path.is_file():
                return FileResponse(path, media_type=file_type[0])
    raise HTTPException(404, detail="file_not_found")


def extract_gpas_and_percentages(education_str):
    import json
    result = {"cgpa": None, "percent_10": None, "percent_12": None}
    if not education_str:
        return result
    try:
        edu_list = json.loads(education_str)
        if isinstance(edu_list, list):
            for item in edu_list:
                deg = (item.get("degree") or "").strip().lower()
                detail = (item.get("detail") or "").strip()
                if not deg or not detail:
                    continue
                try:
                    val_str = "".join(c for c in detail if c.isdigit() or c == '.')
                    val = float(val_str) if val_str else None
                except ValueError:
                    val = None
                
                if val is None:
                    continue

                # Match 10th
                if any(x in deg for x in ["10", "secondary", "ssc", "matric", "high school", "class x", "class 10"]):
                    result["percent_10"] = val
                # Match 12th
                elif any(x in deg for x in ["12", "senior", "hsc", "intermediate", "diploma", "junior college", "class xii", "class 12"]):
                    result["percent_12"] = val
                # Match College
                elif any(x in deg for x in ["b.tech", "btech", "b.e", "be", "b.sc", "bsc", "bca", "mca", "mtech", "m.tech", "bachelor", "master", "graduation", "university", "college", "degree"]):
                    result["cgpa"] = val
    except Exception:
        pass
    return result


def get_user_from_auth_header(request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        return None
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    token = parts[1]
    try:
        payload_token = decode_token(token)
        return payload_token
    except Exception:
        return None


def student_eligibility_profile(user):
    education = extract_gpas_and_percentages(user.get("education", "[]"))
    try:
        performance = json.loads(user.get("uni_performance") or "{}")
    except (ValueError, TypeError):
        performance = {}
    return education, performance


def check_student_eligibility(user_dict, drive_dict, profile=None) -> tuple:
    if user_dict.get("role") != "student":
        return False, "Not a student"
    edu_info, uni_perf = profile if profile is not None else student_eligibility_profile(user_dict)

    student_cgpa = None
    if isinstance(uni_perf, dict) and uni_perf.get("aggregate_cgpa"):
        try:
            student_cgpa = float(uni_perf["aggregate_cgpa"])
        except ValueError:
            pass
    if student_cgpa is None:
        student_cgpa = edu_info.get("cgpa")
        
    # Check CGPA requirement
    drive_min_cgpa_str = drive_dict.get("eligibility", "")
    if drive_min_cgpa_str and drive_min_cgpa_str.strip():
        try:
            drive_min_cgpa = float(drive_min_cgpa_str)
            if student_cgpa is None:
                return False, "CGPA information is missing from your profile"
            if student_cgpa < drive_min_cgpa:
                return False, f"Your CGPA ({student_cgpa:.2f}) does not meet the minimum requirement of {drive_min_cgpa:.2f}"
        except ValueError:
            pass
            
    # Check 10th percentage requirement
    drive_min_10th_str = drive_dict.get("min_10th_percent", "")
    if drive_min_10th_str and drive_min_10th_str.strip():
        try:
            drive_min_10th = float(drive_min_10th_str)
            student_10th = edu_info.get("percent_10")
            if student_10th is None:
                return False, "10th standard percentage is missing from your profile"
            if student_10th < drive_min_10th:
                return False, f"Your 10th standard percentage ({student_10th:.2f}%) does not meet the minimum requirement of {drive_min_10th:.2f}%"
        except ValueError:
            pass
            
    # Check 12th percentage requirement
    drive_min_12th_str = drive_dict.get("min_12th_percent", "")
    if drive_min_12th_str and drive_min_12th_str.strip():
        try:
            drive_min_12th = float(drive_min_12th_str)
            student_12th = edu_info.get("percent_12")
            if student_12th is None:
                return False, "12th standard percentage is missing from your profile"
            if student_12th < drive_min_12th:
                return False, f"Your 12th standard percentage ({student_12th:.2f}%) does not meet the minimum requirement of {drive_min_12th:.2f}%"
        except ValueError:
            pass

    # Check active backlogs requirement
    drive_no_backlogs = drive_dict.get("no_active_backlogs", 0)
    if drive_no_backlogs:
        live_backlogs = 0
        if isinstance(uni_perf, dict) and "semesters" in uni_perf:
            for sem in uni_perf["semesters"]:
                lb_val = sem.get("live_backlogs")
                if lb_val is not None and str(lb_val).strip() != "":
                    try:
                        live_backlogs += int(lb_val)
                    except ValueError:
                        pass
        if live_backlogs > 0:
            return False, f"This drive requires 0 active backlogs, but you have {live_backlogs} active backlog(s)"

    # Check eligible courses
    drive_courses_str = drive_dict.get("eligible_courses", "")
    if drive_courses_str and drive_courses_str.strip():
        drive_courses = [c.strip().lower() for c in drive_courses_str.split("\n") if c.strip()]
        if drive_courses:
            student_course = (user_dict.get("course") or "").strip().lower()
            if not student_course or student_course not in drive_courses:
                return False, f"Your course ({user_dict.get('course') or 'Not specified'}) is not in the list of eligible courses"

    fit_details = []
    if student_cgpa is not None:
        try:
            min_cgpa_val = float(drive_min_cgpa_str)
            fit_details.append(f"your {student_cgpa:.2f} CGPA meets the minimum requirement of {min_cgpa_val:.2f}")
        except Exception:
            fit_details.append(f"your {student_cgpa:.2f} CGPA")
    fit_detail_str = "Specifically, " + ", ".join(fit_details) + "." if fit_details else ""
    explanation = f"Your academic performance and technical profile align with the eligibility criteria for this role. {fit_detail_str}"
    
    return True, explanation

def run_broadcast_task(drive, base_url, changes=None):
    def broadcast():
        from datetime import datetime

        drive_id = drive["id"]
        stipend = f"₹{drive['stipend']} / month" if drive.get("stipend") else "TBD"
        package = f"₹{drive['package']} LPA" if drive.get("package") else "TBD"
        drive_type = drive.get("type") or "Placement"
        compensation = package
        if drive_type == "Internship":
            compensation = stipend
        elif drive_type == "Internship + PPO":
            compensation = f"{stipend} + {package} PPO"

        date = drive.get("drive_date") or "TBD"
        try:
            date = datetime.strptime(date, "%Y-%m-%d").strftime("%b %d, %Y")
        except ValueError:
            pass
        updated = "\n".join(f"- {change}" for change in changes or [])
        logo = f"{base_url}/api/partners/{drive['partner_id']}/logo" if drive.get("partner_id") else None
        last_id = 0
        while True:
            with SessionLocal() as db:
                already_sent = db.query(OpportunityAlertSent.id).filter(
                    OpportunityAlertSent.student_id == User.id,
                    OpportunityAlertSent.drive_id == drive_id,
                ).exists()
                rows = db.query(
                    User.id, User.email, User.full_name, User.username, User.role,
                    User.course, User.education, User.uni_performance,
                ).filter(
                    User.id > last_id, User.role == "student",
                    User.email.is_not(None), User.email != "", ~already_sent,
                ).order_by(User.id).limit(100).all()
            if not rows:
                break

            last_id = rows[-1].id
            sent = []
            for student in rows:
                eligible, explanation = check_student_eligibility(student._asdict(), drive)
                if eligible and student.email.strip() and send_opportunity_alert_email(
                    student.email, student.full_name or student.username, drive["company"],
                    drive["role"], drive_type, drive.get("location") or "TBD",
                    compensation, date, explanation, base_url=base_url,
                    updated_requirements_str=updated, company_logo_url=logo, synchronous=True,
                ):
                    sent.append({"drive_id": drive_id, "student_id": student.id})
            if sent:
                with SessionLocal.begin() as db:
                    db.bulk_insert_mappings(OpportunityAlertSent, sent)

    try:
        if not submit_broadcast(broadcast):
            logger.error("Broadcast backlog is full for drive %s", drive["id"])
    except RuntimeError:
        logger.exception("Could not start the email worker for drive %s", drive["id"])


@app.post('/api/drives')
def post_drive(request: Request, payload: dict):
    # only admin may create drives
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
    company, job_role = payload.get('company'), payload.get('role')
    if not isinstance(company, str) or not company.strip() or not isinstance(job_role, str) or not job_role.strip():
        raise HTTPException(422, detail='Enter a company name and job role.')
    drive = create_drive(
        company.strip(), job_role.strip(), type=payload.get('type'),
        eligibility=payload.get('eligibility'), package=payload.get('package'), drive_date=payload.get('drive_date'),
        location=payload.get('location'), stipend=payload.get('stipend'), description=payload.get('description'),
        other_benefits=payload.get('other_benefits'), duration=payload.get('duration'),
        eligible_courses=payload.get('eligible_courses'), selection_process=payload.get('selection_process'),
        about_company=payload.get('about_company'), website=payload.get('website'),
        org_size=payload.get('org_size'), contact_person=payload.get('contact_person'),
        responsibilities=payload.get('responsibilities'), requirements=payload.get('requirements'),
        tech_stack=payload.get('tech_stack'),
        no_active_backlogs=payload.get('no_active_backlogs', 0),
        min_10th_percent=payload.get('min_10th_percent', ''),
        min_12th_percent=payload.get('min_12th_percent', ''),
        partner_id=payload.get('partner_id')
    )

    drive_cache.invalidate()
    stats_cache.invalidate()
    run_broadcast_task(drive, email_base_url(request))

    return drive


@app.get('/api/drives')
def get_drives(request: Request):
    identity = request_identity(request)
    drives = drive_cache.get(list_drives)
    if identity["role"] != "student":
        return drives
    with SessionLocal() as db:
        student = db.query(User.role, User.course, User.education, User.uni_performance).filter_by(
            username=identity["sub"], role="student",
        ).first()
    if not student:
        raise HTTPException(401, detail="user_not_found")
    user = student._asdict()
    profile = student_eligibility_profile(user)
    return [drive for drive in drives if check_student_eligibility(user, drive, profile)[0]]


@app.get('/api/drives/{drive_id}')
def get_drive_detail(drive_id: int, request: Request):
    identity = request_identity(request)
    with SessionLocal() as db:
        drive = db.query(Drive).filter(Drive.id == drive_id).first()
        if not drive:
            raise HTTPException(status_code=404, detail='drive_not_found')
            
        company_logo = ""
        if drive.partner_id:
            has_logo = db.query(User.id).filter(User.id == drive.partner_id, User.role == "hr", User.profile_image != "").first()
            if has_logo:
                company_logo = f"/api/partners/{drive.partner_id}/logo"

        drive_dict = {
            "id": drive.id,
            "company": drive.company,
            "role": drive.role,
            "type": drive.type or "Full-time",
            "eligibility": drive.eligibility or "Open to all",
            "package": drive.package or "TBD",
            "drive_date": drive.drive_date or "TBD",
            "location": drive.location or "",
            "stipend": drive.stipend or "",
            "description": drive.description or "",
            "other_benefits": drive.other_benefits or "",
            "duration": drive.duration or "",
            "eligible_courses": drive.eligible_courses or "",
            "selection_process": drive.selection_process or "",
            "about_company": drive.about_company or "",
            "website": drive.website or "",
            "org_size": drive.org_size or "",
            "contact_person": drive.contact_person or "",
            "responsibilities": drive.responsibilities or "",
            "requirements": drive.requirements or "",
            "tech_stack": drive.tech_stack or "",
            "no_active_backlogs": drive.no_active_backlogs or 0,
            "min_10th_percent": drive.min_10th_percent or "",
            "min_12th_percent": drive.min_12th_percent or "",
            "partner_id": drive.partner_id,
            "company_logo": company_logo
        }
        
        if identity["role"] == "student":
            user = db.query(User.role, User.course, User.education, User.uni_performance).filter_by(username=identity["sub"], role="student").first()
            if not user:
                raise HTTPException(401, detail="user_not_found")
            is_eligible, _ = check_student_eligibility(user._asdict(), drive_dict)
            if not is_eligible:
                raise HTTPException(status_code=403, detail='not_eligible')
                
        return drive_dict



@app.put('/api/drives/{drive_id}')
def update_drive_endpoint(drive_id: int, payload: dict, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
        
    with SessionLocal() as db:
        drive = db.query(Drive).filter(Drive.id == drive_id).first()
        if not drive:
            raise HTTPException(status_code=404, detail='drive_not_found')
            
        # Compare before updating
        changes = []
        def clean_val(v):
            return str(v or '').strip()

        old_cgpa = clean_val(drive.eligibility)
        new_cgpa = clean_val(payload.get('eligibility', drive.eligibility))
        if old_cgpa != new_cgpa:
            changes.append(f"Minimum CGPA requirement changed from {old_cgpa or 'None'} to {new_cgpa or 'None'}")

        old_10 = clean_val(drive.min_10th_percent)
        new_10 = clean_val(payload.get('min_10th_percent', drive.min_10th_percent))
        if old_10 != new_10:
            changes.append(f"Minimum Class 10th percentage changed from {old_10 or 'None'}% to {new_10 or 'None'}%")

        old_12 = clean_val(drive.min_12th_percent)
        new_12 = clean_val(payload.get('min_12th_percent', drive.min_12th_percent))
        if old_12 != new_12:
            changes.append(f"Minimum Class 12th percentage changed from {old_12 or 'None'}% to {new_12 or 'None'}%")

        old_backlogs = drive.no_active_backlogs or 0
        new_backlogs = payload.get('no_active_backlogs', drive.no_active_backlogs or 0)
        if old_backlogs != new_backlogs:
            old_str = "No active backlogs allowed" if old_backlogs else "Active backlogs allowed"
            new_str = "No active backlogs allowed" if new_backlogs else "Active backlogs allowed"
            changes.append(f"Backlog requirement changed from '{old_str}' to '{new_str}'")

        old_courses = clean_val(drive.eligible_courses)
        new_courses = clean_val(payload.get('eligible_courses', drive.eligible_courses))
        if old_courses != new_courses:
            changes.append("Eligible courses / specializations list was updated")

        # Update fields
        drive.company = payload.get('company', drive.company)
        drive.role = payload.get('role', drive.role)
        drive.type = payload.get('type', drive.type)
        drive.eligibility = payload.get('eligibility', drive.eligibility)
        drive.package = payload.get('package', drive.package)
        drive.drive_date = payload.get('drive_date', drive.drive_date)
        drive.location = payload.get('location', drive.location)
        drive.stipend = payload.get('stipend', drive.stipend)
        drive.description = payload.get('description', drive.description)
        drive.other_benefits = payload.get('other_benefits', drive.other_benefits)
        drive.duration = payload.get('duration', drive.duration)
        drive.eligible_courses = payload.get('eligible_courses', drive.eligible_courses)
        drive.selection_process = payload.get('selection_process', drive.selection_process)
        drive.about_company = payload.get('about_company', drive.about_company)
        drive.website = payload.get('website', drive.website)
        drive.org_size = payload.get('org_size', drive.org_size)
        drive.contact_person = payload.get('contact_person', drive.contact_person)
        drive.responsibilities = payload.get('responsibilities', drive.responsibilities)
        drive.requirements = payload.get('requirements', drive.requirements)
        drive.tech_stack = payload.get('tech_stack', drive.tech_stack)
        if 'no_active_backlogs' in payload:
            drive.no_active_backlogs = payload.get('no_active_backlogs')
        drive.min_10th_percent = payload.get('min_10th_percent', drive.min_10th_percent)
        drive.min_12th_percent = payload.get('min_12th_percent', drive.min_12th_percent)
        if 'partner_id' in payload:
            drive.partner_id = payload.get('partner_id')
        
        db.add(drive)
        db.commit()

        company_logo = ""
        if drive.partner_id:
            has_logo = db.query(User.id).filter(User.id == drive.partner_id, User.role == "hr", User.profile_image != "").first()
            if has_logo:
                company_logo = f"/api/partners/{drive.partner_id}/logo"
        
        ret = {
            "id": drive.id,
            "company": drive.company,
            "role": drive.role,
            "type": drive.type,
            "eligibility": drive.eligibility,
            "package": drive.package,
            "drive_date": drive.drive_date,
            "location": drive.location,
            "stipend": drive.stipend,
            "description": drive.description,
            "other_benefits": drive.other_benefits,
            "duration": drive.duration,
            "eligible_courses": drive.eligible_courses,
            "selection_process": drive.selection_process,
            "about_company": drive.about_company,
            "website": drive.website,
            "org_size": drive.org_size,
            "contact_person": drive.contact_person,
            "responsibilities": drive.responsibilities,
            "requirements": drive.requirements,
            "tech_stack": drive.tech_stack,
            "no_active_backlogs": drive.no_active_backlogs,
            "min_10th_percent": drive.min_10th_percent,
            "min_12th_percent": drive.min_12th_percent,
            "partner_id": drive.partner_id,
            "company_logo": company_logo
        }
        db.close()
        drive_cache.invalidate()
        if changes:
            run_broadcast_task(ret, email_base_url(request), changes=changes)
        return ret


@app.delete('/api/drives/{drive_id}')
def delete_drive_endpoint(drive_id: int, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
        
    from backend.database import SessionLocal, Drive
    with SessionLocal() as db:
        drive = db.query(Drive).filter(Drive.id == drive_id).first()
        if not drive:
            raise HTTPException(status_code=404, detail='drive_not_found')
        db.delete(drive)
        db.commit()
        drive_cache.invalidate()
        stats_cache.invalidate()
        return {'deleted': True, 'drive_id': drive_id}


@app.post('/api/apply')
def apply_drive(request: Request, payload: dict):
    identity = request_identity(request)
    if identity["role"] != "student":
        raise HTTPException(403, detail="student_required")
    try:
        drive_id = int(payload.get("drive_id"))
    except (TypeError, ValueError):
        raise HTTPException(422, detail="invalid_drive_id")

    with SessionLocal.begin() as db:
        student = db.query(User.id, User.role, User.course, User.education, User.uni_performance).filter_by(
            username=identity["sub"], role="student",
        ).with_for_update().first()
        if not student:
            raise HTTPException(401, detail="user_not_found")
        drive = db.get(Drive, drive_id)
        if not drive:
            raise HTTPException(404, detail="drive_not_found")
        existing = db.query(Application).filter_by(user_id=student.id, drive_id=drive.id).first()
        if existing:
            return application_result(existing)
        criteria = {column.name: getattr(drive, column.name) for column in Drive.__table__.columns}
        if not check_student_eligibility(student._asdict(), criteria)[0]:
            raise HTTPException(403, detail="not_eligible")
        application = Application(user_id=student.id, drive_id=drive.id)
        db.add(application)
        db.flush()
        result = application_result(application)
    stats_cache.invalidate()
    return result


def application_result(application):
    return {key: getattr(application, key) for key in ("id", "user_id", "drive_id", "status")}


@app.get('/api/applications')
def get_applications(request: Request):
    identity = request_identity(request)
    admin = identity["role"] == "admin"
    with SessionLocal() as db:
        query = db.query(
            Application.id, Application.user_id, Application.drive_id,
            Application.status, Application.created_at, Drive.company, Drive.role,
        ).outerjoin(Drive, Drive.id == Application.drive_id)
        if admin:
            query = query.add_columns(
                User.full_name.label("student_name"), User.email.label("student_email"),
                User.phone.label("student_phone"),
            ).outerjoin(User, User.id == Application.user_id)
        else:
            query = query.add_columns(Drive.package, Drive.drive_date).join(
                User, User.id == Application.user_id,
            ).filter(User.username == identity["sub"])
        rows = query.order_by(Application.created_at.desc()).all()
    return [
        {**row._asdict(), "company": row.company or "Unknown", "role": row.role or "Unknown"}
        for row in rows
    ]


@app.post('/api/applications/{app_id}/status')
def update_app_status(app_id: int, payload: dict, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
    
    from backend.database import SessionLocal, Application
    with SessionLocal() as db:
        app_entry = db.query(Application).filter(Application.id == app_id).first()
        if not app_entry:
            raise HTTPException(status_code=404, detail='application_not_found')
        app_entry.status = payload.get('status', 'approved')
        db.add(app_entry)
        db.commit()
        stats_cache.invalidate()
        return {"id": app_entry.id, "status": app_entry.status}


@app.delete('/api/applications/{app_id}')
def delete_application(app_id: int, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        username = payload_token.get('sub')
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail='user_not_found')
    
    from backend.database import SessionLocal, Application
    with SessionLocal() as db:
        app_entry = db.query(Application).filter(Application.id == app_id).first()
        if not app_entry:
            raise HTTPException(status_code=404, detail='application_not_found')
        if role != 'admin' and app_entry.user_id != user['id']:
            raise HTTPException(status_code=403, detail='forbidden')
        db.delete(app_entry)
        db.commit()
        stats_cache.invalidate()
        return {'deleted': True, 'app_id': app_id}




# ── Admin: List Students ─────────────────────────────────────────────────────
@app.get('/api/admin/students')
def admin_list_students(request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
    return list_users()


# ── Admin: Create Student ─────────────────────────────────────────────────────
@app.post('/api/admin/students')
def admin_create_student(payload: CreateStudentPayload, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
    # Check for duplicates
    if get_user(payload.username):
        raise HTTPException(status_code=400, detail='username_taken')
    if payload.email and get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail='email_taken')
    hashed = hash_password(payload.password)
    try:
        user = create_user(
            payload.username, hashed, role='student',
            full_name=payload.full_name, email=payload.email,
            enrollment_id=payload.enrollment_id,
            course=payload.course,
            must_change_password="1"
        )
    except ValueError:
        raise HTTPException(status_code=400, detail='username_taken')

    # Generate a set-password token and send the welcome email (non-blocking)
    sp_token = create_set_password_token(payload.username)
    
    # Retrieve base URL respecting proxy headers if present (e.g. Render/Vercel)
    base_url = email_base_url(request)

    send_welcome_email(
        to_email=payload.email,
        student_name=payload.full_name or payload.username,
        set_password_token=sp_token,
        base_url=base_url
    )

    user.pop("hashed_password", None)
    stats_cache.invalidate()
    return user


# ── Admin: Create Corporate Partner (HR) ──────────────────────────────────────
@app.post('/api/admin/partners')
def admin_create_partner(payload: CreatePartnerPayload, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')

    if payload.email and get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail='email_taken')

    username = payload.email.split('@')[0].lower()
    if get_user(username):
        import time
        username = f"{username}_{int(time.time())}"

    import secrets
    temp_password = secrets.token_urlsafe(12)
    hashed = hash_password(temp_password)

    try:
        user = create_user(
            username=username,
            hashed_password=hashed,
            role='hr',
            full_name=payload.full_name,
            email=payload.email,
            enrollment_id=payload.company, # company name stored in enrollment_id
            must_change_password="1"
        )
    except ValueError:
        raise HTTPException(status_code=400, detail='username_taken')

    sp_token = create_set_password_token(username)

    base_url = email_base_url(request)

    send_partner_welcome_email(
        to_email=payload.email,
        partner_name=payload.full_name,
        company_name=payload.company,
        set_password_token=sp_token,
        base_url=base_url
    )

    user.pop("hashed_password", None)
    stats_cache.invalidate()
    return user


# ── Admin: List Corporate Partners ────────────────────────────────────────────
@app.get('/api/admin/partners')
def admin_list_partners(request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')

    from backend.database import SessionLocal, User
    with SessionLocal() as db:
        partners = db.query(User).filter(User.role == 'hr').all()
        return [
            {
                "id": p.id,
                "username": p.username,
                "full_name": p.full_name,
                "email": p.email,
                "company": p.enrollment_id,
                "profile_image": p.profile_image or "",
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in partners
        ]


# ── Serve Corporate Partner Logo as raw binary image ────────────────────────
@app.get("/api/partners/{partner_id}/logo")
def get_partner_logo(partner_id: int, request: Request):
    import base64
    import binascii

    with SessionLocal() as db:
        value = db.query(User.profile_image).filter_by(id=partner_id, role="hr").scalar()
    if not value:
        raise HTTPException(404, detail="logo_not_found")
    try:
        header, encoded = value.split(",", 1)
        media_type = header.removeprefix("data:").removesuffix(";base64")
        if media_type not in {"image/jpeg", "image/png", "image/gif", "image/webp"}:
            raise ValueError("Unsupported logo")
        content = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error):
        raise HTTPException(404, detail="invalid_logo_data") from None
    etag = '"' + hashlib.sha256(content).hexdigest() + '"'
    headers = {"Cache-Control": "public, max-age=300", "ETag": etag}
    if request.headers.get("If-None-Match") == etag:
        return Response(status_code=304, headers=headers)
    return Response(content, media_type=media_type, headers=headers)


# ── Admin: Delete Corporate Partner ───────────────────────────────────────────
@app.delete('/api/admin/partners/{user_id}')
def admin_delete_partner(user_id: int, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')

    from backend.database import SessionLocal, User
    with SessionLocal() as db:
        partner = db.query(User).filter(User.id == user_id, User.role == 'hr').first()
        if not partner:
            raise HTTPException(status_code=404, detail='partner_not_found')
        db.delete(partner)
        db.commit()
    drive_cache.invalidate()
    stats_cache.invalidate()
    return {'deleted': True, 'user_id': user_id}


# ── HR / Corporate Partner: List Students ──────────────────────────────────────
@app.get('/api/partner/students')
def partner_list_students(request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'hr':
        raise HTTPException(status_code=403, detail='hr_required')

    from backend.database import SessionLocal, User
    with SessionLocal() as db:
        students = db.query(User).filter(User.role == 'student').all()
        return [
            {
                "id": s.id,
                "username": s.username,
                "full_name": s.full_name,
                "email": s.email,
                "phone": s.phone,
                "course": s.course or "",
                "is_eligible": s.is_eligible or 0,
                "enrollment_id": s.enrollment_id or "",
                "location": s.location or "",
                "headline": s.headline or "",
                "uni_performance": s.uni_performance or "{}"
            }
            for s in students
        ]


# ── Admin: Test Email (synchronous — returns exact error) ─────────────────────


@app.post('/api/admin/test-email')
def admin_test_email(payload: TestEmailPayload, request: Request):
    """Send a test email synchronously and return the result + full config (admin only)."""
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')

    result = send_test_email_sync(payload.to_email)
    # Always return 200 with the result dict — the "ok" field indicates success
    return result


# ── Admin: Email Config Status (no sending) ──────────────────────────────
@app.get('/api/admin/email-config')
def admin_email_config(request: Request):
    """Return email provider config for display in admin panel (admin only)."""
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
    return get_config_status()


# ── Admin: Delete Student ─────────────────────────────────────────────────────
@app.delete('/api/admin/students/{user_id}')
def admin_delete_student(user_id: int, request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')

    from backend.database import SessionLocal, User, Application
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail='user_not_found')
        if user.role == 'admin':
            raise HTTPException(status_code=403, detail='cannot_delete_admin')
        # Delete their applications first (FK safety)
        db.query(Application).filter(Application.user_id == user_id).delete()
        db.query(StoredUpload).filter_by(owner_id=user_id).delete()
        db.delete(user)
        db.commit()
    drive_cache.invalidate()
    stats_cache.invalidate()
    return {'deleted': True, 'user_id': user_id}


# ── Set Password (token-based, for newly invited students) ───────────────────
@app.post('/api/set-password')
def set_password(payload: SetPasswordPayload):
    """Validate the set-password JWT and update the user's password."""
    try:
        data = decode_password_token(payload.token)
    except JWTError:
        raise HTTPException(status_code=400, detail='invalid_or_expired_token')

    purpose = data.get('purpose')
    if purpose not in ('set_password', 'reset_password'):
        raise HTTPException(status_code=400, detail='invalid_token_purpose')

    username = data.get('sub')
    if not username:
        raise HTTPException(status_code=400, detail='invalid_token')

    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail='user_not_found')
    if purpose == "set_password" and user["must_change_password"] != "1":
        raise HTTPException(400, detail="invalid_or_expired_token")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=422, detail='password_too_short')

    new_hashed = hash_password(payload.new_password)
    ok = update_password(username, new_hashed, token=payload.token, expected_hash=user["hashed_password"], expires_at=data["exp"])
    if not ok:
        raise HTTPException(400, detail="invalid_or_expired_token")

    # Return a fresh login token so the frontend can auto-login
    access_token = create_access_token({'sub': username, 'role': user.get('role', 'student')})
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'role': user.get('role', 'student'),
        'message': 'password_set',
        'purpose': purpose
    }


class ForgotPasswordPayload(BaseModel):
    email: str


@app.post('/api/forgot-password')
def forgot_password(payload: ForgotPasswordPayload, request: Request):
    """Handle forgot password: create 1-hour JWT token and send reset email."""
    email = payload.email.strip().lower()
    user = get_user_by_email(email)
    
    if user:
        reset_token = create_reset_password_token(user['username'])
        
        # Retrieve base URL respecting proxy headers if present (e.g. Render/Vercel)
        base_url = email_base_url(request)
        
        send_reset_password_email(
            to_email=user['email'],
            student_name=user.get('full_name') or user['username'],
            reset_token=reset_token,
            base_url=base_url
        )
        
    # Always return a generic success message to prevent email enumeration
    return {'ok': True, 'message': 'If an account exists, a reset link has been sent.'}


# ── Request Activation / Forgot Password (resends setup links) ────────────────
class RequestActivationPayload(BaseModel):
    email: str


@app.post('/api/request-activation')
def request_activation(payload: RequestActivationPayload, request: Request):
    """Locate the user by email, generate a new token, and resend the welcome activation email."""
    user = get_user_by_email(payload.email)
    if not user or user['must_change_password'] != '1':
        return {'ok': True, 'message': 'activation_link_sent'}

    sp_token = create_set_password_token(user['username'])

    # Retrieve base URL respecting proxy headers if present (e.g. Render/Vercel)
    base_url = email_base_url(request)

    name = user.get('full_name') or user['username']
    if user['role'] == 'hr':
        send_partner_welcome_email(user['email'], name, user.get('enrollment_id') or '', sp_token, base_url=base_url)
    else:
        send_welcome_email(user['email'], name, sp_token, base_url=base_url)
    return {'ok': True, 'message': 'activation_link_sent'}



# ── Admin: Update Own Profile ─────────────────────────────────────────────────
@app.post('/api/admin/profile')
def admin_update_profile(request: Request, payload: dict):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    try:
        payload_token = decode_token(token)
        username = payload_token.get('sub')
        role = payload_token.get('role')
    except JWTError:
        raise HTTPException(status_code=401, detail='invalid_token')
    if role != 'admin':
        raise HTTPException(status_code=403, detail='admin_required')
    updated = update_profile(
        username,
        full_name=payload.get('full_name'),
        email=payload.get('email'),
        phone=payload.get('phone'),
        headline=payload.get('headline'),
        profile_image=payload.get('profile_image')
    )
    if not updated:
        raise HTTPException(status_code=404, detail='user_not_found')
    updated.pop("hashed_password", None)
    return updated

@app.get("/api/dashboard/stats")
def dashboard_stats(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="missing_authorization")

    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="invalid_authorization")

    token = parts[1]

    try:
        payload_token = decode_token(token)
        role = payload_token.get("role")
    except JWTError:
        raise HTTPException(status_code=401, detail="invalid_token")

    if role != "admin":
        raise HTTPException(status_code=403, detail="admin_required")

    return stats_cache.get(load_dashboard_stats)


def load_dashboard_stats():
    students = select(func.count()).select_from(User).where(User.role == "student").scalar_subquery()
    drives = select(func.count()).select_from(Drive).scalar_subquery()
    placed = (select(func.count(distinct(Application.user_id))).join(User, User.id == Application.user_id)
              .where(Application.status == "approved", User.role == "student").scalar_subquery())
    with SessionLocal() as db:
        totals = db.execute(select(
            students.label("total_students"), drives.label("total_drives"),
            select(func.count()).select_from(Application).scalar_subquery().label("total_applications"),
            placed.label("placed_students"),
        )).one()._asdict()
    return {
        **totals,
        "active_drives": totals["total_drives"],
        "placement_percentage": round(totals["placed_students"] / totals["total_students"] * 100, 1) if totals["total_students"] else 0,
    }


# ── SPA catch-all ────────────────────────────────────────────────────────────
# All non-API routes return the React index.html (or serve matching files from frontend_dist) so client-side routing works.
@app.get('/{full_path:path}')
def spa_catchall(full_path: str):
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(404, detail="not_found")
    root = Path(FRONTEND_DIST).resolve()
    if full_path:
        file_path = (root / full_path).resolve()
        if file_path.is_relative_to(root) and file_path.is_file() and file_path.name != "index.html":
            return FileResponse(file_path, headers={"Cache-Control": "public, max-age=3600"})

    index = root / "index.html"
    if index.is_file():
        return FileResponse(index, headers={"Cache-Control": "no-cache"})
    return JSONResponse({"detail": "Frontend build unavailable"}, status_code=503)
