from pydantic import BaseModel


class UserOut(BaseModel):
    id: str
    employee_id: str
    username: str | None = None
    name: str
    email: str | None = None
    role: str
    department: str | None = None
    reporting_manager_name: str | None = None
    avatar_url: str | None = None
    is_active: bool = True
    last_login_at: str | None = None


class LoginRequest(BaseModel):
    identifier: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class LogoutResponse(BaseModel):
    message: str


class MeResponse(UserOut):
    pass
