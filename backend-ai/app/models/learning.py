from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class LearningCandidate(Base):
    __tablename__ = "learning_candidates"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    source_submission_id: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True
    )
    complaint_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    complaint_title: Mapped[str] = mapped_column(Text)
    complaint_description: Mapped[str] = mapped_column(Text)

    original_category: Mapped[str] = mapped_column(String(120))
    original_department: Mapped[str] = mapped_column(String(100))
    original_manager: Mapped[str] = mapped_column(String(120))
    original_recommendation: Mapped[str] = mapped_column(Text)

    verification_rating: Mapped[str] = mapped_column(String(30))
    verification_score: Mapped[float] = mapped_column(Float)
    employee_comments: Mapped[str] = mapped_column(Text)

    corrected_category: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True
    )
    corrected_department: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )
    corrected_manager: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True
    )
    corrected_action: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    reviewer_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="Needs Review",
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )
