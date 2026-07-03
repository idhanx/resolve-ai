from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


def resolve_database_url() -> str | None:
    raw_url = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")
    if not raw_url:
        return None
    if raw_url.startswith("postgresql+asyncpg://"):
        return raw_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql://", 1)
    return raw_url


def main() -> int:
    psql_path = shutil.which("psql")
    if not psql_path:
        print("Error: psql is not installed on this system.", file=sys.stderr)
        return 1

    database_url = resolve_database_url()
    if not database_url:
        print("Error: DATABASE_URL or NEON_DATABASE_URL is not set.", file=sys.stderr)
        return 1

    sql_file = Path(__file__).with_name("schema.sql")
    result = subprocess.run(
        [psql_path, database_url, "-v", "ON_ERROR_STOP=1", "-f", str(sql_file)],
        check=False,
    )

    if result.returncode != 0:
        print("Database table creation failed.", file=sys.stderr)
        return result.returncode

    print("Database tables created successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
