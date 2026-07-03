from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import RevokedToken, User


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_employee_identifier(db: AsyncSession, identifier: str) -> User | None:
    stmt = select(User).where(
        (User.employee_id == identifier) | (User.email == identifier) | (User.username == identifier)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_jti(db: AsyncSession, jti: str) -> RevokedToken | None:
    result = await db.execute(select(RevokedToken).where(RevokedToken.jti == jti))
    return result.scalar_one_or_none()


async def create_revoked_token(db: AsyncSession, jti: str, expires_at: str | None = None) -> RevokedToken:
    token = RevokedToken(jti=jti, token_expires_at=expires_at)
    db.add(token)
    await db.commit()
    await db.refresh(token)
    return token

