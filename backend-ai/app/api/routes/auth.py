from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.repositories.auth_repository import auth_repository
from app.schemas.auth import AuthLoginRequest, AuthLoginResponse, AuthUserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


def _user_response(user) -> AuthUserResponse:
    return AuthUserResponse(
        id=user.id,
        profile_id=user.profile_id,
        username=user.username,
        display_name=user.full_name,
        role=user.role,
        department=user.department,
        manager_id=user.manager_id,
        email=user.email,
        avatar_url=user.avatar_url,
    )


@router.post("/login", response_model=AuthLoginResponse)
async def login(
    payload: AuthLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await auth_repository.authenticate(
        db,
        payload.username,
        payload.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token, _ = await auth_repository.create_session(db, user)
    return AuthLoginResponse(
        access_token=token,
        user=_user_response(user),
    )


@router.get("/me", response_model=AuthUserResponse)
async def me(current_user=Depends(get_current_user)):
    return _user_response(current_user)


@router.post("/logout")
async def logout(
    authorization: str | None = Header(default=None),
    _current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Revoke the latest active session for the current token.
    # The dependency ensures the token is valid before this handler runs.
    if not authorization:
        return {"detail": "Logged out successfully."}

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return {"detail": "Logged out successfully."}

    session = await auth_repository.get_active_session_by_token(
        db,
        token.strip(),
    )

    if session is not None:
        await auth_repository.revoke_session(db, session)

    return {"detail": "Logged out successfully."}
