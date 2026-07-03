from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    employee_id: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        index=True,
        nullable=False,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
    )

    username: Mapped[str | None] = mapped_column(
        String(80),
        unique=True,
        index=True,
        nullable=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(32),
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    department: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
    )

    reporting_manager_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    avatar_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    last_login_at: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    # Employee's own complaints
    complaints = relationship(
        "Complaint",
        foreign_keys="Complaint.employee_id",
        back_populates="employee",
        lazy="selectin",
    )

    # Complaints assigned to this manager
    assigned_complaints = relationship(
        "Complaint",
        foreign_keys="Complaint.assigned_manager_id",
        back_populates="assigned_manager",
        lazy="selectin",
    )


class RevokedToken(Base, UUIDMixin):
    __tablename__ = "revoked_tokens"

    jti: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )

    token_expires_at: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )