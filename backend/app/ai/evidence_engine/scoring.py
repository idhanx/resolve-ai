def score_evidence(evidence_items: list[str]) -> int:
    score = 50 + min(len(evidence_items) * 10, 40)
    return min(score, 100)

