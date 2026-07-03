from functools import lru_cache
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict


ASYNC_PG_UNSUPPORTED_QUERY_PARAMS = {
    "channel_binding",
    "sslmode",
}


def _normalize_database_url(url: str) -> str:
    normalized = url.strip()

    if normalized.startswith("postgres://"):
        normalized = normalized.replace(
            "postgres://",
            "postgresql+asyncpg://",
            1,
        )
    elif normalized.startswith("postgresql://"):
        normalized = normalized.replace(
            "postgresql://",
            "postgresql+asyncpg://",
            1,
        )

    if not normalized.startswith("postgresql+asyncpg://"):
        return normalized

    parsed = urlsplit(normalized)
    query_params = [
        (key, value)
        for key, value in parse_qsl(parsed.query, keep_blank_values=True)
        if key not in ASYNC_PG_UNSUPPORTED_QUERY_PARAMS
    ]

    return urlunsplit(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            urlencode(query_params),
            parsed.fragment,
        )
    )


class Settings(BaseSettings):

    DATABASE_URL: str

    GROQ_API_KEY: str

    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    DB_ECHO: bool = False

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        extra="ignore"
    )

    @property
    def async_database_url(self) -> str:
        return _normalize_database_url(self.DATABASE_URL)


@lru_cache
def get_settings():
    return Settings()
