from datetime import datetime

from pydantic import BaseModel


class SurveyRatings(BaseModel):
    communication: int
    growth: int
    managerSupport: int
    environment: int
    recognition: int
    workLifeBalance: int


class SurveyCreate(BaseModel):
    ratings: SurveyRatings
    comments: str | None = None


class SurveyOut(BaseModel):
    id: str
    date: datetime
    ratings: dict
    comments: str | None = None

