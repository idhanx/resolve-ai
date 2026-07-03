from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.repositories.learning_repository import learning_repository
from app.schemas.learning import (
    LearningCandidateCreate,
    LearningCandidateDecision,
    LearningCandidateResponse,
)


router = APIRouter(
    prefix="/learning",
    tags=["Learning"],
    dependencies=[Depends(get_current_user)],
)


@router.post(
    "/candidates",
    response_model=LearningCandidateResponse
)
async def create_learning_candidate(
    payload: LearningCandidateCreate,
    db: AsyncSession = Depends(get_db)
):
    return await learning_repository.create(
        db,
        payload
    )


@router.get(
    "/candidates",
    response_model=list[LearningCandidateResponse]
)
async def list_learning_candidates(
    status: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    return await learning_repository.list(
        db,
        status
    )


@router.patch(
    "/candidates/{candidate_id}/decision",
    response_model=LearningCandidateResponse
)
async def decide_learning_candidate(
    candidate_id: int,
    payload: LearningCandidateDecision,
    db: AsyncSession = Depends(get_db)
):
    action = payload.action.strip().lower()

    if action not in {"approve", "reject"}:
        raise HTTPException(
            status_code=400,
            detail="Decision action must be approve or reject."
        )

    candidate = await learning_repository.get(
        db,
        candidate_id
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Learning candidate not found"
        )

    return await learning_repository.decide(
        db,
        candidate,
        payload
    )
