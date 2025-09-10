import re
from typing import List, Tuple, Dict, Any
from app.db import conn_cursor

_WORD = re.compile(r"[A-Za-z0-9']+")

def _units_from_text(text: str) -> List[str]:
    if not isinstance(text, str):
        return []
    # Split on sentence boundaries; trim empties
    units = [u.strip() for u in re.split(r"[.!?]\s+", text or "") if u.strip()]
    # If someone passes a very short answer with no punctuation, ensure at least one unit
    return units or ([text.strip()] if (text or "").strip() else [])

def _tokens(s: str) -> set:
    if not isinstance(s, str):
        return set()
    return {m.group(0).lower() for m in _WORD.finditer(s)}

def _unit_score(unit: str, evidence_texts: List[str]) -> float:
    # Score a unit by best token-overlap with any evidence snippet
    utoks = _tokens(unit)
    if not utoks:
        return 0.0
    best = 0.0
    for ev in evidence_texts:
        etoks = _tokens(ev)
        if not etoks:
            continue
        inter = len(utoks & etoks)
        denom = len(utoks)
        if denom:
            best = max(best, inter / denom)
    return best

def collect_memory_evidence(user_id: str, q: str, k: int = 5) -> List[str]:
    """Pull semantic memory chunks for grounding; return list of text strings."""
    try:
        with conn_cursor() as (conn, cur):
            cur.execute(
                """
                SELECT chunk
                FROM memory_semantic
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (user_id, max(1, int(k))),
            )
            rows = cur.fetchall() or []
    except Exception:
        rows = []
    # Normalize to strings
    ev = []
    for r in rows:
        v = r[0] if isinstance(r, (list, tuple)) else r
        if isinstance(v, str) and v.strip():
            ev.append(v.strip())
    return ev

def grounding_score(answer: str, sources: List[str], memory_rows: List[str]) -> Tuple[float, Dict[str, Any]]:
    """
    Return (score, meta) where score in [0,1].
    Score is mean of best-per-unit overlaps across evidence (sources + memory).
    Fully guarded against empty inputs.
    """
    units = _units_from_text(answer)
    # pick up to ~8 evidence texts (favor explicit sources if provided)
    evidence_texts = [s for s in (sources or []) if isinstance(s, str) and s.strip()]
    if not evidence_texts:
        evidence_texts = memory_rows or []
    # keep size bounded
    evidence_texts = evidence_texts[:16]

    if not units or not evidence_texts:
        # no way to ground → return 0.0, include details
        meta = {
            "units": units,
            "per_unit_best": [0.0 for _ in units],
            "evidence_used": evidence_texts[:8],
            "note": "no units or no evidence",
        }
        return 0.0, meta

    per_unit = [_unit_score(u, evidence_texts) for u in units]
    # safe mean
    denom = max(1, len(per_unit))
    score = sum(per_unit) / denom

    meta = {
        "units": units,
        "per_unit_best": per_unit,
        "evidence_used": evidence_texts[:8],
    }
    return float(score), meta
