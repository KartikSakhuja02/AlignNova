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

from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db, get_user, get_user_by_email, create_user, update_profile, create_drive, list_drives, create_application, list_applications, list_users, update_password
from backend.email_service import send_welcome_email, send_test_email_sync, print_config, get_config_status, send_reset_password_email
from backend.models import UserPublic, CreateStudentPayload, SetPasswordPayload, RequestActivationPayload, TestEmailPayload
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse
from backend.access_token import create_access_token, get_current_user_from_token, decode_token, create_set_password_token, create_reset_password_token

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

app = FastAPI(title="AlignNova")
main = app
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend_dist")

# Serve React static assets (JS/CSS/images) — only if the build exists
_dist_assets = os.path.join(FRONTEND_DIST, "assets")
if os.path.isdir(_dist_assets):
    app.mount("/assets", StaticFiles(directory=_dist_assets), name="assets")


@app.on_event("startup")
def on_startup():
    init_db()
    # Print email config to Render logs for easy debugging
    print_config()
    # seed demo users for presentation
    try:
        if not get_user("admin"):
            create_user("admin", hash_password("adminpass"), role="admin", full_name="Administrator", email="admin@demo.local")
    except Exception:
        pass



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
    user = get_user(form_data.username)
    if not user:
        user = get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="invalid_credentials")
    token = create_access_token({"sub": user["username"], "role": user.get("role")})
    return {"access_token": token, "token_type": "bearer", "role": user.get("role")}


@app.post('/api/signup')
def signup(data: UserPublic):
    existing = get_user(data.username)
    if existing:
        raise HTTPException(status_code=400, detail='username_taken')
    if data.email and get_user_by_email(data.email):
        raise HTTPException(status_code=400, detail='email_taken')
    hashed = hash_password(data.password)
    try:
        user = create_user(data.username, hashed, role=data.role, full_name=data.full_name, email=data.email, phone=data.phone, enrollment_id=data.enrollment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail='username_taken')
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
    return user.dict()


@app.get("/api/profile")
def get_profile(user = Depends(get_current_user)):
    return user.dict()


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
    return updated


from fastapi import UploadFile, File
import shutil

@app.post('/api/profile/resume')
async def upload_resume(request: Request, file: UploadFile = File(...)):
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
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail='user_not_found')
    
    # Check that file is PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='only_pdf_allowed')
    
    # Save the file
    uploads_dir = os.path.join(BASE_DIR, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Use a unique name to avoid collisions
    filename = f"{user['id']}_{file.filename}"
    file_path = os.path.join(uploads_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    resume_url = f"/api/uploads/{filename}"
    
    # Update profile in db
    updated = update_profile(
        username,
        resume_name=file.filename,
        resume_url=resume_url
    )
    return updated


@app.post('/api/profile/marksheet')
async def upload_marksheet(request: Request, file: UploadFile = File(...)):
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
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail='user_not_found')
    
    # Check that file is PDF or image
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.pdf', '.jpg', '.jpeg', '.png'):
        raise HTTPException(status_code=400, detail='only_pdf_and_images_allowed')
    
    # Save the file
    uploads_dir = os.path.join(BASE_DIR, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    import uuid
    filename = f"marksheet_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(uploads_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    url = f"/api/uploads/{filename}"
    return {"filename": file.filename, "url": url}


@app.get('/api/uploads/{filename}')
def get_uploaded_file(filename: str):
    uploads_dir = os.path.join(BASE_DIR, 'uploads')
    file_path = os.path.join(uploads_dir, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail='file_not_found')
    ext = os.path.splitext(filename)[1].lower()
    if ext == '.pdf':
        media_type = 'application/pdf'
    elif ext in ('.jpg', '.jpeg'):
        media_type = 'image/jpeg'
    elif ext == '.png':
        media_type = 'image/png'
    else:
        media_type = 'application/octet-stream'
    return FileResponse(file_path, media_type=media_type)


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
    drive = create_drive(
        payload.get('company', ''), payload.get('role', ''), type=payload.get('type'),
        eligibility=payload.get('eligibility'), package=payload.get('package'), drive_date=payload.get('drive_date'),
        location=payload.get('location'), stipend=payload.get('stipend'), description=payload.get('description'),
        other_benefits=payload.get('other_benefits'), duration=payload.get('duration'),
        eligible_courses=payload.get('eligible_courses'), selection_process=payload.get('selection_process'),
        about_company=payload.get('about_company'), website=payload.get('website'),
        org_size=payload.get('org_size'), contact_person=payload.get('contact_person'),
        responsibilities=payload.get('responsibilities'), requirements=payload.get('requirements'),
        tech_stack=payload.get('tech_stack'),
        no_active_backlogs=payload.get('no_active_backlogs', 0)
    )
    return drive


@app.get('/api/drives')
def get_drives():
    return list_drives()


@app.get('/api/drives/{drive_id}')
def get_drive_detail(drive_id: int):
    from backend.database import SessionLocal, Drive
    with SessionLocal() as db:
        drive = db.query(Drive).filter(Drive.id == drive_id).first()
        if not drive:
            raise HTTPException(status_code=404, detail='drive_not_found')
        return {
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
            "no_active_backlogs": drive.no_active_backlogs or 0
        }


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
        
    from backend.database import SessionLocal, Drive
    with SessionLocal() as db:
        drive = db.query(Drive).filter(Drive.id == drive_id).first()
        if not drive:
            raise HTTPException(status_code=404, detail='drive_not_found')
            
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
        
        db.add(drive)
        db.commit()
        db.refresh(drive)
        
        return {
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
            "no_active_backlogs": drive.no_active_backlogs
        }


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
        return {'deleted': True, 'drive_id': drive_id}


@app.post('/api/apply')
def apply_drive(request: Request, payload: dict):
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
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=404, detail='user_not_found')
    app_entry = create_application(user_id=user['id'], drive_id=int(payload.get('drive_id')))
    return app_entry


@app.get('/api/applications')
def get_applications(request: Request):
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
    
    from backend.database import SessionLocal, Application, Drive, User
    with SessionLocal() as db:
        if role == 'admin':
            results = []
            apps = db.query(Application).order_by(Application.created_at.desc()).all()
            for app in apps:
                d = db.query(Drive).filter(Drive.id == app.drive_id).first()
                u = db.query(User).filter(User.id == app.user_id).first()
                results.append({
                    "id": app.id,
                    "user_id": app.user_id,
                    "drive_id": app.drive_id,
                    "status": app.status,
                    "created_at": app.created_at.isoformat() if app.created_at else None,
                    "company": d.company if d else "Unknown",
                    "role": d.role if d else "Unknown",
                    "student_name": u.full_name if u else "Unknown",
                    "student_email": u.email if u else "Unknown",
                    "student_phone": u.phone if u else "Unknown"
                })
            return results
        else:
            results = []
            apps = db.query(Application).filter(Application.user_id == user['id']).order_by(Application.created_at.desc()).all()
            for app in apps:
                d = db.query(Drive).filter(Drive.id == app.drive_id).first()
                results.append({
                    "id": app.id,
                    "user_id": app.user_id,
                    "drive_id": app.drive_id,
                    "status": app.status,
                    "created_at": app.created_at.isoformat() if app.created_at else None,
                    "company": d.company if d else "Unknown",
                    "role": d.role if d else "Unknown",
                    "package": d.package if d else None,
                    "drive_date": d.drive_date if d else None
                })
            return results


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
        db.refresh(app_entry)
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
    proto = request.headers.get("x-forwarded-proto", "http")
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    base_url = f"{proto}://{host}" if host else str(request.base_url).rstrip("/")

    send_welcome_email(
        to_email=payload.email,
        student_name=payload.full_name or payload.username,
        set_password_token=sp_token,
        base_url=base_url
    )

    return user


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
        db.delete(user)
        db.commit()
    return {'deleted': True, 'user_id': user_id}


# ── Set Password (token-based, for newly invited students) ───────────────────
@app.post('/api/set-password')
def set_password(payload: SetPasswordPayload):
    """Validate the set-password JWT and update the user's password."""
    try:
        data = decode_token(payload.token)
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

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=422, detail='password_too_short')

    new_hashed = hash_password(payload.new_password)
    ok = update_password(username, new_hashed)
    if not ok:
        raise HTTPException(status_code=500, detail='update_failed')

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
        proto = request.headers.get("x-forwarded-proto", "http")
        host = request.headers.get("x-forwarded-host") or request.headers.get("host")
        base_url = f"{proto}://{host}" if host else str(request.base_url).rstrip("/")
        
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
    if not user:
        raise HTTPException(status_code=404, detail='email_not_found')

    sp_token = create_set_password_token(user['username'])

    # Retrieve base URL respecting proxy headers if present (e.g. Render/Vercel)
    proto = request.headers.get("x-forwarded-proto", "http")
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    base_url = f"{proto}://{host}" if host else str(request.base_url).rstrip("/")

    send_welcome_email(
        to_email=user['email'],
        student_name=user.get('full_name') or user['username'],
        set_password_token=sp_token,
        base_url=base_url
    )
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

    from backend.database import SessionLocal, User, Drive, Application

    with SessionLocal() as db:
        total_students = db.query(User).filter(User.role == "student").count()
        total_drives = db.query(Drive).count()
        total_applications = db.query(Application).count()

        placed_students = (
            db.query(Application)
            .filter(Application.status == "approved")
            .count()
        )

        placement_percentage = (
            round((placed_students / total_students) * 100, 1)
            if total_students > 0 else 0
        )

    return {
        "total_students": total_students,
        "total_drives": total_drives,
        "total_applications": total_applications,
        "placed_students": placed_students,
        "placement_percentage": placement_percentage,
        "active_drives": total_drives
    }

# ── SPA catch-all ────────────────────────────────────────────────────────────
# All non-API routes return the React index.html (or serve matching files from frontend_dist) so client-side routing works.
@app.get('/{full_path:path}')
def spa_catchall(full_path: str):
    # If the file exists in frontend_dist (e.g. logo.png or favicon.svg), serve it directly
    if full_path:
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path) and os.path.basename(file_path) != 'index.html':
            return FileResponse(file_path)

    index = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.isfile(index):
        return FileResponse(index)
    # Fallback if the frontend hasn't been built yet
    return JSONResponse({'detail': 'Frontend not built. Run: cd frontend && npm run build'}, status_code=503)
