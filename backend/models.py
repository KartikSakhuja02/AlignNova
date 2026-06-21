from pydantic import BaseModel
from typing import Optional

class UserPublic(BaseModel):
    username: str
    role: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    enrollment_id: Optional[str] = None
    location: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    website_url: Optional[str] = ""
    headline: Optional[str] = ""
    bio: Optional[str] = ""
    education: Optional[str] = "[]"
    experience: Optional[str] = "[]"
    profile_image: Optional[str] = ""
    resume_name: Optional[str] = ""
    resume_url: Optional[str] = ""
    is_eligible: Optional[int] = 0
    skills: Optional[str] = "[]"
    languages: Optional[str] = "[]"
    projects: Optional[str] = "[]"
    course: Optional[str] = ""
    uni_performance: Optional[str] = "{}"

class CreateStudentPayload(BaseModel):
    full_name: str
    email: str
    username: str
    password: str
    department: Optional[str] = None
    enrollment_id: Optional[str] = None
    course: Optional[str] = ""

class SetPasswordPayload(BaseModel):
    token: str
    new_password: str

class RequestActivationPayload(BaseModel):
    email: str

class TestEmailPayload(BaseModel):
    to_email: str