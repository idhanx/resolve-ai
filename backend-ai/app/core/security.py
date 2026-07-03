from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta


PBKDF2_ITERATIONS = 310_000
PBKDF2_SALT_BYTES = 16
SESSION_TTL_DAYS = 30


def _encode_bytes(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii")


def _decode_bytes(value: str) -> bytes:
    return base64.urlsafe_b64decode(value.encode("ascii"))


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt_bytes = (
        _decode_bytes(salt)
        if salt is not None
        else secrets.token_bytes(PBKDF2_SALT_BYTES)
    )

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_bytes,
        PBKDF2_ITERATIONS,
    )

    return _encode_bytes(salt_bytes), _encode_bytes(digest)


def verify_password(password: str, salt: str, password_hash: str) -> bool:
    candidate_salt, candidate_hash = hash_password(password, salt)
    return hmac.compare_digest(candidate_salt, salt) and hmac.compare_digest(
        candidate_hash,
        password_hash,
    )


def create_session_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return token, token_hash


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def session_expiry() -> datetime:
    return datetime.utcnow() + timedelta(days=SESSION_TTL_DAYS)
