from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, oauth2_scheme, resolve_user_by_identifier
from app.models.user import User
from app.repositories.user_repository import create_revoked_token
from app.schemas.auth import LoginRequest, LogoutResponse, MeResponse, TokenResponse, UserOut
from app.utils.logger import log_event
from app.utils.security import create_access_token, decode_access_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

FAILED_LOGIN_ATTEMPTS: dict[str, list[datetime]] = {}
MAX_FAILED_ATTEMPTS = 10
WINDOW_SECONDS = 15 * 60


def _register_failed_attempt(ip: str) -> bool:
    now = datetime.now(timezone.utc)
    attempts = FAILED_LOGIN_ATTEMPTS.setdefault(ip, [])
    attempts[:] = [ts for ts in attempts if (now - ts).total_seconds() < WINDOW_SECONDS]
    attempts.append(now)
    return len(attempts) > MAX_FAILED_ATTEMPTS


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    if _register_failed_attempt(client_ip):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many failed login attempts")

    user = await resolve_user_by_identifier(db, payload.identifier)
    if not user or not verify_password(payload.password, user.hashed_password):
        log_event("failed_login", user.employee_id if user else None, 401, "Incorrect credentials", {"ip": client_ip})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")

    token, expires_in, jti = create_access_token(subject=str(user.id), role=user.role, employee_id=user.employee_id)
    user.last_login_at = datetime.now(timezone.utc).isoformat()
    await db.commit()
    log_event("successful_login", user.employee_id, 200, "Login succeeded", {"jti": jti})
    return TokenResponse(
        access_token=token,
        expires_in=expires_in,
        user=UserOut(
            id=str(user.id),
            employee_id=user.employee_id,
            username=user.username,
            name=user.name,
            email=user.email,
            role=user.role,
            department=user.department,
            reporting_manager_name=user.reporting_manager_name,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            last_login_at=user.last_login_at,
        ),
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payload = decode_access_token(token)
    if not payload or not payload.get("jti"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    await create_revoked_token(db, payload["jti"], expires_at=str(payload.get("exp")))
    log_event("logout", current_user.employee_id, 200, "Logout succeeded", {"jti": payload["jti"]})
    return LogoutResponse(message="Logged out successfully")


@router.get("/me", response_model=MeResponse)
async def me(current_user: User = Depends(get_current_user)):
    return MeResponse(
        id=str(current_user.id),
        employee_id=current_user.employee_id,
        username=current_user.username,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        department=current_user.department,
        reporting_manager_name=current_user.reporting_manager_name,
        avatar_url=current_user.avatar_url,
        is_active=current_user.is_active,
        last_login_at=current_user.last_login_at,
    )
