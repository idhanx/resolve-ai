from pydantic import BaseModel


class KPI(BaseModel):
    label: str
    value: str | int


class DashboardSummary(BaseModel):
    role: str
    metrics: list[KPI]
    notes: list[str] = []

