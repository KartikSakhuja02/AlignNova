
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import hashlib
import os

from backend.database import init_db, get_user, get_user_by_email, create_user, update_profile, create_drive, list_drives, create_application, list_applications, list_users
from backend.models import UserPublic
from fastapi.responses import RedirectResponse, FileResponse, JSONResponse


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

app = FastAPI(title="AlignNova")
main = app
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend_dist")

# Serve React static assets (JS/CSS/images) — only if the build exists
_dist_assets = os.path.join(FRONTEND_DIST, "assets")
if os.path.isdir(_dist_assets):
    app.mount("/assets", StaticFiles(directory=_dist_assets), name="assets")


@app.on_event("startup")
def on_startup():
    init_db()
    # seed demo users for presentation
    try:
        if not get_user("admin"):
            create_user("admin", hash_password("adminpass"), role="admin", full_name="Administrator", email="admin@demo.local")
    except Exception:
        pass
    try:
        if not get_user("alice"):
            create_user("alice", hash_password("alicepass"), role="student", full_name="Alice Demo", email="alice@demo.local")
    except Exception:
        pass


def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire, "sub": data.get("sub"), "role": data.get("role")})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user_from_token(token: str) -> UserPublic:
    try:
        payload = decode_token(token)
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="invalid_token")
    except JWTError:
        raise HTTPException(status_code=401, detail="invalid_token")
    user = get_user(username)
    if not user:
        raise HTTPException(status_code=401, detail="user_not_found")
    return UserPublic(
        username=user["username"],
        role=user.get("role", "student"),
        full_name=user.get("full_name"),
        email=user.get("email"),
        phone=user.get("phone"),
        enrollment_id=user.get("enrollment_id"),
        location=user.get("location", ""),
        linkedin_url=user.get("linkedin_url", ""),
        website_url=user.get("website_url", ""),
        headline=user.get("headline", ""),
        bio=user.get("bio", ""),
        education=user.get("education", "[]"),
        experience=user.get("experience", "[]"),
        profile_image=user.get("profile_image", "")
    )


def _get_token_from_request(request: Request) -> Optional[str]:
    auth = request.headers.get('Authorization')
    if auth:
        parts = auth.split()
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            return parts[1]
    return request.cookies.get('access_token')


def get_optional_user(request: Request) -> Optional[UserPublic]:
    token = _get_token_from_request(request)
    if not token:
        return None
    try:
        payload = decode_token(token)
        username = payload.get('sub')
        if not username:
            return None
    except JWTError:
        return None
    user = get_user(username)
    if not user:
        return None
    return UserPublic(
        username=user['username'],
        role=user.get('role', 'student'),
        full_name=user.get('full_name'),
        email=user.get('email'),
        phone=user.get('phone'),
        enrollment_id=user.get('enrollment_id'),
        location=user.get('location', ""),
        linkedin_url=user.get('linkedin_url', ""),
        website_url=user.get('website_url', ""),
        headline=user.get('headline', ""),
        bio=user.get('bio', ""),
        education=user.get('education', "[]"),
        experience=user.get('experience', "[]"),
        profile_image=user.get('profile_image', "")
    )


def hash_password(password: str) -> str:
    password = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return pwd_context.verify(plain_password, hashed_password)


@app.post("/api/signup")
def signup(data: UserPublic):
    existing = get_user(data.username)
    if existing:
        raise HTTPException(status_code=400, detail="username_taken")
    hashed = hash_password(data.password)
    try:
        user = create_user(data.username, hashed, role=data.role, full_name=data.full_name, email=data.email, phone=data.phone)
    except ValueError:
        raise HTTPException(status_code=400, detail="username_taken")
    token = create_access_token({"sub": user["username"], "role": user.get("role")})
    return {"access_token": token, "token_type": "bearer", "role": user.get("role")}


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


@app.get('/api/profile')
def get_profile(request: Request):
    auth = request.headers.get('Authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='missing_authorization')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_authorization')
    token = parts[1]
    user = get_current_user_from_token(token)
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
        location=payload.get('location'),
        linkedin_url=payload.get('linkedin_url'),
        website_url=payload.get('website_url'),
        headline=payload.get('headline'),
        bio=payload.get('bio'),
        education=payload.get('education'),
        experience=payload.get('experience'),
        profile_image=payload.get('profile_image')
    )
    if not updated:
        raise HTTPException(status_code=404, detail='user_not_found')
    return updated


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
    drive = create_drive(payload.get('company', ''), payload.get('role', ''), type=payload.get('type'), eligibility=payload.get('eligibility'), package=payload.get('package'), drive_date=payload.get('drive_date'))
    return drive


@app.get('/api/drives')
def get_drives():
    return list_drives()


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
class CreateStudentPayload(BaseModel):
    full_name: str
    email: str
    username: str
    password: str
    department: Optional[str] = None
    enrollment_id: Optional[str] = None


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
            enrollment_id=payload.enrollment_id
        )
    except ValueError:
        raise HTTPException(status_code=400, detail='username_taken')
    return user


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


# ── SPA catch-all ────────────────────────────────────────────────────────────
# All non-API routes return the React index.html so client-side routing works.
@app.get('/{full_path:path}')
def spa_catchall(full_path: str):
    index = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.isfile(index):
        return FileResponse(index)
    # Fallback if the frontend hasn't been built yet
    return JSONResponse({'detail': 'Frontend not built. Run: cd frontend && npm run build'}, status_code=503)


