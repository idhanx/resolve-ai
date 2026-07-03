import re
from pathlib import Path


def compact_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def slugify_filename(filename: str) -> str:
    name = Path(filename).name
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name[:255]

