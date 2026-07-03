from functools import lru_cache
from json import loads as json_loads
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Echo Backend"
    environment: str = "development"
    database_url: str | None = None
    neon_database_url: str | None = None
    secret_key: str = "change-me-in-env"
    algorithm: str = "HS256"
    access_token_expire_hours: int = 8
    session_keepalive_minutes: int = 30
    allowed_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
        ]
    )
    auto_create_schema: bool = True
    upload_dir: str = "backend/uploads"
    output_dir: str = "backend/outputs"
    max_upload_mb: int = 10

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("[") and stripped.endswith("]"):
                try:
                    parsed = json_loads(stripped)
                except ValueError:
                    parsed = None
                else:
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    def _normalize_database_url(self, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    def _strip_asyncpg_unsupported_query(self, value: str) -> tuple[str, dict[str, object]]:
        parts = urlsplit(value)
        if parts.scheme not in {"postgresql+asyncpg", "postgresql"}:
            return value, {}

        query_items = dict(parse_qsl(parts.query, keep_blank_values=True))
        connect_args: dict[str, object] = {}

        sslmode = query_items.pop("sslmode", None)
        if sslmode and sslmode.lower() != "disable":
            connect_args["ssl"] = True

        query_items.pop("channel_binding", None)
        cleaned_url = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query_items), parts.fragment))
        return cleaned_url, connect_args

    def _resolve_postgres_settings(self, value: str) -> tuple[str, dict[str, object]]:
        normalized = self._normalize_database_url(value)
        return self._strip_asyncpg_unsupported_query(normalized)

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            url, _ = self._resolve_postgres_settings(self.database_url)
            return url
        if self.neon_database_url:
            url, _ = self._resolve_postgres_settings(self.neon_database_url)
            return url
        return "sqlite+aiosqlite:///./backend_dev.db"

    @property
    def resolved_connect_args(self) -> dict[str, object]:
        if self.database_url:
            _, connect_args = self._resolve_postgres_settings(self.database_url)
            return connect_args
        if self.neon_database_url:
            _, connect_args = self._resolve_postgres_settings(self.neon_database_url)
            return connect_args
        if self.resolved_database_url.startswith("sqlite"):
            return {"check_same_thread": False}
        return {}


@lru_cache
def get_settings() -> Settings:
    return Settings()
