"""Generate the sample policy PDF from the RAG knowledge source."""

from __future__ import annotations

import json
import textwrap
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
SOURCE = BACKEND_ROOT / "knowledge" / "policy_faq.json"
OUTPUT = BACKEND_ROOT.parent / "docs" / "ResolveAI_Sample_Employee_Policy_FAQ.pdf"


def _escape_pdf_text(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
    )


def _document_lines() -> list[str]:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    metadata = payload["document"]
    lines = [
        metadata["title"],
        f"Version {metadata['version']} | Effective {metadata['effective_date']}",
        metadata["disclaimer"],
        "",
    ]

    for entry in payload["entries"]:
        lines.extend(
            [
                f"{entry['id']} - {entry['title']}",
                f"Type: {entry['type'].title()} | Owner: {entry['owner']} | Department: {entry['department']}",
                f"Policy: {entry['content']}",
                f"Required action: {entry['action']}",
                f"Escalation: {entry['escalation']}",
                "",
            ]
        )

    wrapped: list[str] = []
    for line in lines:
        wrapped.extend(textwrap.wrap(line, width=92) or [""])
    return wrapped


def generate_pdf() -> Path:
    lines = _document_lines()
    pages = [lines[index:index + 47] for index in range(0, len(lines), 47)]
    objects: list[bytes] = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    page_ids: list[int] = []

    for page_lines in pages:
        page_id = len(objects) + 1
        content_id = page_id + 1
        page_ids.append(page_id)
        objects.append(
            (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                f"/Resources << /Font << /F1 3 0 R >> >> /Contents {content_id} 0 R >>"
            ).encode("ascii")
        )
        commands = ["BT", "/F1 9 Tf", "48 750 Td", "14 TL"]
        for line in page_lines:
            commands.append(f"({_escape_pdf_text(line)}) Tj")
            commands.append("T*")
        commands.append("ET")
        stream = "\n".join(commands).encode("latin-1", errors="replace")
        objects.append(
            f"<< /Length {len(stream)} >>\nstream\n".encode("ascii")
            + stream
            + b"\nendstream"
        )

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("ascii")

    output = bytearray(b"%PDF-1.4\n%ResolveAI\n")
    offsets = [0]
    for object_id, body in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{object_id} 0 obj\n".encode("ascii"))
        output.extend(body)
        output.extend(b"\nendobj\n")

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_bytes(output)
    return OUTPUT


if __name__ == "__main__":
    print(generate_pdf())
