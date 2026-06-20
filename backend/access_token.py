from fastapi import HTTPException, Request
from backend.models import UserPublic
from backend.database import get_user
from typing import Optional
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire, "sub": data.get("sub"), "role": data.get("role")})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_set_password_token(username: str) -> str:
    """Generate a single-use JWT for the set-password flow (7-day expiry)."""
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode(
        {"sub": username, "purpose": "set_password", "exp": expire},
        SECRET_KEY, algorithm=ALGORITHM
    )

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
        profile_image=user.get("profile_image", ""),
        resume_name=user.get("resume_name", ""),
        resume_url=user.get("resume_url", ""),
        is_eligible=user.get("is_eligible", 0),
        skills=user.get("skills", "[]"),
        languages=user.get("languages", "[]"),
        projects=user.get("projects", "[]")
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
        profile_image=user.get('profile_image', ""),
        resume_name=user.get('resume_name', ""),
        resume_url=user.get('resume_url', ""),
        is_eligible=user.get('is_eligible', 0),
        skills=user.get('skills', "[]"),
        languages=user.get('languages', "[]"),
        projects=user.get('projects', "[]")
    )
