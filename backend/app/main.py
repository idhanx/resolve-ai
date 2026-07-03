from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.ceo import router as ceo_router
from app.api.complaints import router as complaints_router
from app.api.dashboard import router as dashboard_router
from app.api.department_head import router as department_head_router
from app.api.employee import router as employee_router
from app.api.manager import router as manager_router
from app.api.notifications import router as notifications_router
from app.api.survey import router as survey_router
from app.config import get_settings
from app.database import init_db
from app.middleware.logging import RequestLoggingMiddleware

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(manager_router)
app.include_router(department_head_router)
app.include_router(ceo_router)
app.include_router(complaints_router)
app.include_router(survey_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)


@app.on_event("startup")
async def startup() -> None:
    if settings.auto_create_schema:
        await init_db()


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.environment}

