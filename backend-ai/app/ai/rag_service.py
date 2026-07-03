"""Hybrid local retrieval for policy, FAQ, resolved cases, and approved fixes."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Any


BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent
POLICY_SOURCE = BACKEND_ROOT / "knowledge" / "policy_faq.json"
RESOLVED_CASE_SOURCE = PROJECT_ROOT / "synthetic_rag_data.csv"

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "our",
    "that",
    "the",
    "their",
    "this",
    "to",
    "we",
    "with",
}

CATEGORY_ALIASES = {
    "career development": "Career Development & Growth",
    "compensation": "Compensation & Benefits",
    "developer experience": "Developer Experience & Infrastructure",
    "leadership": "Leadership & Management",
    "work environment": "Work Environment & Safety",
}


def _tokenize(value: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z0-9]+", value.lower())
        if len(token) > 2 and token not in STOPWORDS
    }


def _normalize_category(value: str | None) -> str:
    if not value:
        return "General Organizational Wellness"

    normalized = value.strip()
    return CATEGORY_ALIASES.get(normalized.lower(), normalized)


def _same_category(left: str | None, right: str | None) -> bool:
    return _normalize_category(left).lower() == _normalize_category(right).lower()


def _department_matches(target: str | None, candidate: str | None) -> bool:
    if not target or not candidate:
        return False

    candidate = candidate.strip().lower()
    return candidate == "all" or target.strip().lower() == candidate


class RAGService:
    """Small, auditable retrieval layer for the MVP.

    This intentionally avoids a vector DB dependency. Scores combine keyword
    phrase hits, lexical overlap, category/department hints, and source trust.
    """

    async def retrieve(
        self,
        complaint: str,
        category: str | None = None,
        department: str | None = None,
        top_k: int = 6,
        db: Any | None = None,
    ) -> list[dict[str, Any]]:
        candidates = [
            *self._policy_entries(),
            *self._resolved_case_entries(),
            *(await self._approved_correction_entries(db)),
        ]

        return self._rank(
            complaint=complaint,
            candidates=candidates,
            category=category,
            department=department,
            top_k=top_k,
        )

    def retrieve_similar_cases(
        self,
        complaint: str,
        category: str,
        department: str | None = None,
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        """Backward-compatible local resolved-case search used by old scripts."""

        return self._rank(
            complaint=complaint,
            candidates=self._resolved_case_entries(),
            category=category,
            department=department,
            top_k=top_k,
        )

    def build_rag_context(self, matches: list[dict[str, Any]]) -> str:
        if not matches:
            return "No relevant policy, FAQ, resolved case, or approved correction was found."

        context: list[str] = []

        for index, match in enumerate(matches, start=1):
            context.append(
                "\n".join(
                    [
                        f"Source {index}: {match['citation']}",
                        f"Type: {match['source_type']}",
                        f"Category: {match['category']}",
                        f"Department: {match['department']}",
                        f"Owner: {match.get('owner') or 'Unassigned'}",
                        f"Evidence: {match['content']}",
                        f"Recommended action: {match['recommended_action']}",
                        f"Escalation: {match.get('escalation') or 'Use executive review if unresolved.'}",
                    ]
                )
            )

        return "\n\n".join(context)

    def _rank(
        self,
        complaint: str,
        candidates: list[dict[str, Any]],
        category: str | None,
        department: str | None,
        top_k: int,
    ) -> list[dict[str, Any]]:
        query_tokens = _tokenize(complaint)
        complaint_lc = complaint.lower()
        ranked: list[dict[str, Any]] = []

        for candidate in candidates:
            haystack = " ".join(
                str(candidate.get(field) or "")
                for field in (
                    "title",
                    "content",
                    "recommended_action",
                    "escalation",
                    "category",
                    "department",
                    "owner",
                )
            )
            candidate_tokens = _tokenize(haystack)
            overlap = query_tokens.intersection(candidate_tokens)
            phrase_hits = [
                keyword
                for keyword in candidate.get("keywords", [])
                if keyword.lower() in complaint_lc
            ]

            score = float(len(overlap))
            score += len(phrase_hits) * 4

            if category and _same_category(category, candidate.get("category")):
                score += 2.5

            if department and _department_matches(department, candidate.get("department")):
                score += 1.5

            score += {
                "approved_correction": 2.0,
                "policy": 1.5,
                "faq": 1.0,
                "resolved_case": 0.5,
            }.get(candidate["source_type"], 0)

            if not overlap and not phrase_hits:
                continue

            ranked.append(
                {
                    **candidate,
                    "score": round(score, 2),
                    "matched_terms": sorted(overlap.union(phrase_hits)),
                }
            )

        ranked.sort(key=lambda item: item["score"], reverse=True)
        return ranked[:top_k]

    def _policy_entries(self) -> list[dict[str, Any]]:
        if not POLICY_SOURCE.exists():
            return []

        payload = json.loads(POLICY_SOURCE.read_text(encoding="utf-8"))
        document = payload.get("document", {})
        entries: list[dict[str, Any]] = []

        for entry in payload.get("entries", []):
            entries.append(
                {
                    "id": entry["id"],
                    "source_type": entry["type"],
                    "title": entry["title"],
                    "category": entry["category"],
                    "department": entry["department"],
                    "owner": entry["owner"],
                    "keywords": entry.get("keywords", []),
                    "content": entry["content"],
                    "recommended_action": entry["action"],
                    "escalation": entry["escalation"],
                    "citation": (
                        f"{entry['id']} - {entry['title']} "
                        f"({document.get('title', 'Policy FAQ')} v{document.get('version', '1.0')})"
                    ),
                }
            )

        return entries

    def _resolved_case_entries(self) -> list[dict[str, Any]]:
        if not RESOLVED_CASE_SOURCE.exists():
            return []

        entries: list[dict[str, Any]] = []

        with RESOLVED_CASE_SOURCE.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)

            for row in reader:
                if (row.get("status") or "").strip().lower() != "resolved":
                    continue

                category = _normalize_category(row.get("category"))
                description = row.get("description") or ""
                resolution = row.get("resolution") or "Manual review"

                entries.append(
                    {
                        "id": f"CASE-{row.get('id')}",
                        "source_type": "resolved_case",
                        "title": description[:120],
                        "category": category,
                        "department": row.get("department") or "All",
                        "owner": row.get("manager") or "Resolved-case owner",
                        "keywords": list(_tokenize(f"{description} {resolution} {category}")),
                        "content": description,
                        "recommended_action": resolution,
                        "escalation": "Use as precedent only after checking current policy.",
                        "citation": f"Resolved case #{row.get('id')} ({category})",
                    }
                )

        return entries

    async def _approved_correction_entries(self, db: Any | None) -> list[dict[str, Any]]:
        if db is None:
            return []

        try:
            from sqlalchemy import select

            from app.models.learning import LearningCandidate

            result = await db.execute(
                select(LearningCandidate).where(
                    LearningCandidate.status == "Approved"
                )
            )
        except Exception:
            return []

        entries: list[dict[str, Any]] = []

        for item in result.scalars().all():
            category = item.corrected_category or item.original_category
            department = item.corrected_department or item.original_department
            action = item.corrected_action or item.original_recommendation
            description = " ".join(
                part
                for part in (
                    item.complaint_title,
                    item.complaint_description,
                    item.employee_comments,
                    item.reviewer_notes,
                )
                if part
            )

            entries.append(
                {
                    "id": f"LEARN-{item.id}",
                    "source_type": "approved_correction",
                    "title": item.complaint_title,
                    "category": _normalize_category(category),
                    "department": department or "All",
                    "owner": item.corrected_manager or item.original_manager,
                    "keywords": list(_tokenize(f"{description} {category} {department} {action}")),
                    "content": (
                        "Approved correction from a failed employee verification: "
                        f"{description}"
                    ),
                    "recommended_action": action,
                    "escalation": "Use because a reviewer approved this corrected outcome.",
                    "citation": f"Approved learning correction #{item.id}",
                }
            )

        return entries


rag_service = RAGService()
