import json
import logging
import sys
from datetime import datetime, timezone


logger = logging.getLogger("echo-backend")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


def log_event(event_type: str, employee_id: str | None, status_code: int, outcome: str, extra: dict | None = None) -> None:
    payload = {
        "event_type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "employee_id": employee_id,
        "status_code": status_code,
        "outcome": outcome,
    }
    if extra:
        payload.update(extra)
    try:
        logger.info(json.dumps(payload))
    except Exception:
        print(json.dumps(payload), file=sys.stderr)

