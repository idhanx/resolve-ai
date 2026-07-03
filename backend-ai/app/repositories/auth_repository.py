from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Iterable

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_session_token,
    hash_password,
    hash_session_token,
    session_expiry,
    verify_password,
)
from app.models.auth import AuthSession, User


@dataclass(frozen=True)
class DemoUserSeed:
    profile_id: str
    username: str
    password: str
    full_name: str
    role: str
    department: str
    manager_id: str | None
    email: str | None
    avatar_url: str | None


DEMO_USER_SEEDS: tuple[DemoUserSeed, ...] = (
    DemoUserSeed(
        profile_id="emp-1",
        username="sarah.chen",
        password="ResolveAI!Sarah2026",
        full_name="Sarah Chen",
        role="Employee",
        department="Technology",
        manager_id="mgr-1",
        email="sarah.chen@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    ),
    DemoUserSeed(
        profile_id="emp-2",
        username="david.miller",
        password="ResolveAI!David2026",
        full_name="David Miller",
        role="Employee",
        department="Technology",
        manager_id="mgr-2",
        email="david.miller@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    ),
    DemoUserSeed(
        profile_id="emp-3",
        username="priya.patel",
        password="ResolveAI!Priya2026",
        full_name="Priya Patel",
        role="Employee",
        department="Operations",
        manager_id="mgr-3",
        email="priya.patel@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    ),
    DemoUserSeed(
        profile_id="emp-4",
        username="marcus.thompson",
        password="ResolveAI!MarcusT2026",
        full_name="Marcus Thompson",
        role="Employee",
        department="Operations",
        manager_id="mgr-4",
        email="marcus.thompson@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    ),
    DemoUserSeed(
        profile_id="mgr-1",
        username="sophia.rodriguez",
        password="ResolveAI!Sophia2026",
        full_name="Sophia Rodriguez",
        role="Manager",
        department="Technology",
        manager_id=None,
        email="sophia.rodriguez@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    ),
    DemoUserSeed(
        profile_id="mgr-2",
        username="alex.kim",
        password="ResolveAI!Alex2026",
        full_name="Alex Kim",
        role="Manager",
        department="Technology",
        manager_id=None,
        email="alex.kim@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    ),
    DemoUserSeed(
        profile_id="mgr-3",
        username="emily.chen",
        password="ResolveAI!Emily2026",
        full_name="Emily Chen",
        role="Manager",
        department="Operations",
        manager_id=None,
        email="emily.chen@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    ),
    DemoUserSeed(
        profile_id="mgr-4",
        username="michael.vance",
        password="ResolveAI!Michael2026",
        full_name="Michael Vance",
        role="Manager",
        department="Operations",
        manager_id=None,
        email="michael.vance@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    ),
    DemoUserSeed(
        profile_id="exec-cto",
        username="aris.thorne",
        password="ResolveAI!Aris2026",
        full_name="Dr. Aris Thorne",
        role="CTO",
        department="Technology",
        manager_id=None,
        email="aris.thorne@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    ),
    DemoUserSeed(
        profile_id="exec-coo",
        username="marcus.sterling",
        password="ResolveAI!MarcusS2026",
        full_name="Marcus Sterling",
        role="COO",
        department="Operations",
        manager_id=None,
        email="marcus.sterling@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    ),
    DemoUserSeed(
        profile_id="exec-ceo",
        username="victoria.vance",
        password="ResolveAI!Victoria2026",
        full_name="Victoria Vance",
        role="CEO",
        department="Technology",
        manager_id=None,
        email="victoria.vance@resolveai.local",
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    ),
)


class AuthRepository:
    async def get_user_by_username(
        self,
        db: AsyncSession,
        username: str,
    ) -> User | None:
        normalized = username.strip().lower()
        result = await db.execute(
            select(User).where(func.lower(User.username) == normalized)
        )
        return result.scalar_one_or_none()

    async def get_user_by_id(
        self,
        db: AsyncSession,
        user_id: int,
    ) -> User | None:
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_user_by_profile_id(
        self,
        db: AsyncSession,
        profile_id: str,
    ) -> User | None:
        result = await db.execute(
            select(User).where(User.profile_id == profile_id)
        )
        return result.scalar_one_or_none()

    async def create_session(
        self,
        db: AsyncSession,
        user: User,
    ) -> tuple[str, AuthSession]:
        token, token_hash = create_session_token()
        session = AuthSession(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=session_expiry(),
            created_at=datetime.utcnow(),
            last_used_at=datetime.utcnow(),
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return token, session

    async def get_active_session_by_token(
        self,
        db: AsyncSession,
        token: str,
    ) -> AuthSession | None:
        token_hash = hash_session_token(token)
        result = await db.execute(
            select(AuthSession).where(
                AuthSession.token_hash == token_hash,
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def revoke_session(
        self,
        db: AsyncSession,
        session: AuthSession,
    ) -> AuthSession:
        session.revoked_at = datetime.utcnow()
        session.last_used_at = datetime.utcnow()
        await db.commit()
        await db.refresh(session)
        return session

    async def touch_session(
        self,
        db: AsyncSession,
        session: AuthSession,
    ) -> AuthSession:
        session.last_used_at = datetime.utcnow()
        await db.commit()
        await db.refresh(session)
        return session

    async def authenticate(
        self,
        db: AsyncSession,
        username: str,
        password: str,
    ) -> User | None:
        user = await self.get_user_by_username(db, username)

        if user is None or not user.is_active:
            return None

        if not verify_password(password, user.password_salt, user.password_hash):
            return None

        return user

    async def seed_demo_users(
        self,
        db: AsyncSession,
        seeds: Iterable[DemoUserSeed] = DEMO_USER_SEEDS,
    ) -> list[User]:
        seeded_users: list[User] = []

        for seed in seeds:
            salt, password_hash = hash_password(seed.password)
            existing = await self.get_user_by_profile_id(db, seed.profile_id)

            if existing is None:
                existing = await self.get_user_by_username(db, seed.username)

            if existing is None:
                user = User(
                    profile_id=seed.profile_id,
                    username=seed.username,
                    full_name=seed.full_name,
                    role=seed.role,
                    department=seed.department,
                    manager_id=seed.manager_id,
                    email=seed.email,
                    avatar_url=seed.avatar_url,
                    password_salt=salt,
                    password_hash=password_hash,
                    is_active=True,
                )
                db.add(user)
                seeded_users.append(user)
                continue

            existing.profile_id = seed.profile_id
            existing.full_name = seed.full_name
            existing.role = seed.role
            existing.department = seed.department
            existing.manager_id = seed.manager_id
            existing.email = seed.email
            existing.avatar_url = seed.avatar_url
            existing.password_salt = salt
            existing.password_hash = password_hash
            existing.is_active = True
            seeded_users.append(existing)

        await db.commit()

        for user in seeded_users:
            await db.refresh(user)

        return seeded_users

    async def clear_expired_sessions(
        self,
        db: AsyncSession,
    ) -> int:
        result = await db.execute(
            delete(AuthSession).where(AuthSession.expires_at <= datetime.utcnow())
        )
        await db.commit()
        return result.rowcount or 0

    async def export_seed_credentials(
        self,
    ) -> list[dict[str, Any]]:
        return [
            {
                "profile_id": seed.profile_id,
                "username": seed.username,
                "password": seed.password,
                "full_name": seed.full_name,
                "role": seed.role,
                "department": seed.department,
            }
            for seed in DEMO_USER_SEEDS
        ]


auth_repository = AuthRepository()
