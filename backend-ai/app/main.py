import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.alerts import router as alert_router
from app.api.routes.complaints import router as complaint_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.learning import router as learning_router
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="ResolveAI Backend",
    version="1.0.0",
    description="AI-powered Employee Complaint Intelligence Platform",
    lifespan=lifespan,
)

# -------------------------------------------------------
# CORS
# Read allowed origins from CORS_ORIGINS env var so any
# deployment domain works without code changes.
# Format: comma-separated URLs, e.g.
#   CORS_ORIGINS=https://resolveai.com,https://www.resolveai.com
# Falls back to the standard Vite dev ports if not set.
# -------------------------------------------------------
_env_origins = os.getenv("CORS_ORIGINS", "")
_extra = [o.strip() for o in _env_origins.split(",") if o.strip()]

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    *_extra,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Health Check
# -----------------------------
@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "ResolveAI Backend",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# -----------------------------
# API Routes
# -----------------------------
app.include_router(complaint_router)
app.include_router(dashboard_router)
app.include_router(alert_router)
app.include_router(learning_router)
app.include_router(auth_router)
