import ssl

from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings
from app.models.base import Base
from app.repositories.auth_repository import auth_repository
import app.models  # noqa: F401

settings = get_settings()
database_url = settings.async_database_url

ssl_context = ssl.create_default_context()
url_info = make_url(database_url)

connect_args = {}

if (
    url_info.drivername == "postgresql+asyncpg"
    and url_info.host not in {"localhost", "127.0.0.1"}
):
    connect_args["ssl"] = ssl_context

engine = create_async_engine(
    database_url,
    echo=settings.DB_ECHO,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for statement in (
            "ALTER TABLE complaints "
            "ADD COLUMN IF NOT EXISTS policy_evidence_json TEXT",
            "ALTER TABLE complaints "
            "ADD COLUMN IF NOT EXISTS routing_reason TEXT",
            "ALTER TABLE complaints "
            "ADD COLUMN IF NOT EXISTS submission_type VARCHAR(30)",
            "ALTER TABLE complaints "
            "ADD COLUMN IF NOT EXISTS assigned_manager_id VARCHAR(80)",
            "ALTER TABLE complaints "
            "ADD COLUMN IF NOT EXISTS action_plan_json TEXT",
            "ALTER TABLE complaints "
            "ADD COLUMN IF NOT EXISTS verification_json TEXT",
        ):
            await conn.execute(text(statement))

    async with AsyncSessionLocal() as session:
        await auth_repository.seed_demo_users(session)
