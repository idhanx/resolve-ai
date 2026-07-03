from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    profile_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )
    username: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True,
    )
    full_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(30), index=True)
    department: Mapped[str] = mapped_column(String(100))
    manager_id: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    email: Mapped[str | None] = mapped_column(
        String(150),
        unique=True,
        nullable=True,
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    password_salt: Mapped[str] = mapped_column(String(64))
    password_hash: Mapped[str] = mapped_column(String(128))
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
