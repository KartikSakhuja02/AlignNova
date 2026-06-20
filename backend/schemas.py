from typing import Optional
from pydantic import BaseModel, Field

class UserPublic(BaseModel):
    username: str
    password: str
    role: Optional[str] = "patient"
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None