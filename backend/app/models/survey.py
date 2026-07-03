from sqlalchemy import ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Survey(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "surveys"

    employee_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.employee_id", ondelete="CASCADE"), index=True, nullable=False)
    ratings: Mapped[dict] = mapped_column(JSON, nullable=False)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
