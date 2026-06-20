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