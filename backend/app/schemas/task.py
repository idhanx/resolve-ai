from pydantic import BaseModel


class TaskOut(BaseModel):
    id: str
    complaint_id: str
    manager_id: str
    title: str
    description: str
    progress: int
    checklist: list[dict]
    instructions: str | None = None

