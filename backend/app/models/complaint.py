from sqlalchemy import (
    Boolean,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Complaint(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "complaints"

    employee_id: Mapped[str] = mapped_column(
        String(32),
        ForeignKey("users.employee_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    complaint_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    department: Mapped[str] = mapped_column(
        String(80),
        index=True,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        index=True,
        default="Submitted",
        nullable=False,
    )

    ai_category: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    priority: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )

    evidence_score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    confidence: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    evidence_breakdown: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    intelligence_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    assigned_executive: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )

    assigned_manager_id: Mapped[str | None] = mapped_column(
        String(32),
        ForeignKey("users.employee_id"),
        index=True,
        nullable=True,
    )

    attachment_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    attachment_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    attachment_mime_type: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    escalated_flag: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    duplicate_fingerprint: Mapped[str | None] = mapped_column(
        String(255),
        index=True,
        nullable=True,
    )

    action_plan: Mapped[list | dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    verification: Mapped[list | dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    evidence_files: Mapped[list | dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # Employee who submitted the complaint
    employee = relationship(
        "User",
        foreign_keys=[employee_id],
        back_populates="complaints",
        lazy="selectin",
    )

    # Manager assigned to the complaint
    assigned_manager = relationship(
        "User",
        foreign_keys=[assigned_manager_id],
        back_populates="assigned_complaints",
        lazy="selectin",
    )


Index(
    "ix_complaints_employee_status_created",
    Complaint.employee_id,
    Complaint.status,
    Complaint.created_at,
)