import hashlib
import html
import re
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings
from app.utils.constants import ALLOWED_ATTACHMENT_EXTENSIONS

settings = get_settings()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(*, subject: str, role: str, employee_id: str) -> tuple[str, int, str]:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=settings.access_token_expire_hours)
    jti = str(uuid4())
    payload = {
        "sub": subject,
        "role": role,
        "employee_id": employee_id,
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
        "jti": jti,
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, int((expires - now).total_seconds()), jti


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


_TAG_RE = re.compile(r"<[^>]+>")
_SQL_RE = re.compile(r"(?i)\b(select|union|insert|update|delete|drop|truncate|alter)\b")


def sanitize_text(value: str) -> str:
    stripped = _TAG_RE.sub("", value)
    escaped = html.escape(stripped)
    return re.sub(r"\s+", " ", escaped).strip()


def contains_malicious_pattern(value: str) -> bool:
    return bool(_SQL_RE.search(value))


def fingerprint_submission(employee_id: str, title: str, description: str) -> str:
    normalized = f"{employee_id}|{title.lower().strip()}|{description.lower().strip()}"
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def is_allowed_attachment(filename: str, mime_type: str | None) -> bool:
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return extension in ALLOWED_ATTACHMENT_EXTENSIONS and (mime_type is None or True)
