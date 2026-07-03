from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class AuthUserResponse(BaseModel):
    id: int
    profile_id: str
    username: str
    display_name: str
    role: str
    department: str
    manager_id: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class AuthLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class AuthSessionResponse(BaseModel):
    session_id: int
    user: AuthUserResponse
    expires_at: datetime
