from datetime import datetime
import json
from typing import Any

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_name: Mapped[str] = mapped_column(String(100))
    employee_email: Mapped[str] = mapped_column(String(150))
    department: Mapped[str] = mapped_column(String(100))
    designation: Mapped[str] = mapped_column(String(100))
    manager: Mapped[str] = mapped_column(String(100))
    assigned_manager_id: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True
    )

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    submission_type: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    category: Mapped[str] = mapped_column(String(100))
    confidence: Mapped[float] = mapped_column(Float)

    severity: Mapped[str] = mapped_column(String(50))
    priority: Mapped[str] = mapped_column(String(50))

    executive_summary: Mapped[str] = mapped_column(Text)
    recommendation: Mapped[str] = mapped_column(Text)
    business_impact: Mapped[str] = mapped_column(Text)
    policy_evidence_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    routing_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    action_plan_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    verification_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Submitted"
    )

    resolution: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    @property
    def policy_evidence(self) -> list[dict]:
        if not self.policy_evidence_json:
            return []

        try:
            return json.loads(self.policy_evidence_json)
        except json.JSONDecodeError:
            return []

    @property
    def action_plan(self) -> dict[str, Any] | None:
        if not self.action_plan_json:
            return None

        try:
            value = json.loads(self.action_plan_json)
        except json.JSONDecodeError:
            return None

        return value if isinstance(value, dict) else None

    @property
    def verification(self) -> dict[str, Any] | None:
        if not self.verification_json:
            return None

        try:
            value = json.loads(self.verification_json)
        except json.JSONDecodeError:
            return None

        return value if isinstance(value, dict) else None
