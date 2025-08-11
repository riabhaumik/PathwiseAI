from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: Optional[str] = None
    created_at: Optional[datetime] = None

class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    email: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    experience_level: str = "beginner"
    preferred_careers: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None 