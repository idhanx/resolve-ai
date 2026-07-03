from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.learning import LearningCandidate
from app.schemas.learning import (
    LearningCandidateCreate,
    LearningCandidateDecision,
)


class LearningRepository:

    async def create(
        self,
        db: AsyncSession,
        payload: LearningCandidateCreate
    ) -> LearningCandidate:
        candidate = LearningCandidate(
            **payload.model_dump()
        )

        db.add(candidate)
        await db.commit()
        await db.refresh(candidate)

        return candidate

    async def list(
        self,
        db: AsyncSession,
        status: str | None = None
    ) -> list[LearningCandidate]:
        query = select(LearningCandidate).order_by(
            LearningCandidate.created_at.desc()
        )

        if status:
            query = query.where(
                LearningCandidate.status == status
            )

        result = await db.execute(query)
        return list(result.scalars().all())

    async def get(
        self,
        db: AsyncSession,
        candidate_id: int
    ) -> LearningCandidate | None:
        result = await db.execute(
            select(LearningCandidate).where(
                LearningCandidate.id == candidate_id
            )
        )

        return result.scalar_one_or_none()

    async def decide(
        self,
        db: AsyncSession,
        candidate: LearningCandidate,
        payload: LearningCandidateDecision
    ) -> LearningCandidate:
        action = payload.action.strip().lower()
        candidate.status = "Approved" if action == "approve" else "Rejected"

        if payload.corrected_category:
            candidate.corrected_category = payload.corrected_category

        if payload.corrected_department:
            candidate.corrected_department = payload.corrected_department

        if payload.corrected_manager:
            candidate.corrected_manager = payload.corrected_manager

        if payload.corrected_action:
            candidate.corrected_action = payload.corrected_action

        if payload.reviewer_notes:
            candidate.reviewer_notes = payload.reviewer_notes

        candidate.reviewed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(candidate)

        return candidate


learning_repository = LearningRepository()
