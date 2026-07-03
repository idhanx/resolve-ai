from app.utils.helpers import compact_whitespace


def preprocess_text(title: str, description: str) -> str:
    return compact_whitespace(f"{title} {description}")

