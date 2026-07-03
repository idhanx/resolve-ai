def build_kpi_payload(total: int, resolved: int) -> dict:
    return {
        "total": total,
        "resolved": resolved,
        "resolution_rate": round((resolved / total) * 100, 2) if total else 0,
    }

