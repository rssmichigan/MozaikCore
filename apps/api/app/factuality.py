from typing import List, Dict, Any, Tuple
import math, re
from app.embeddings import embed_texts
from app.db import conn_cursor
from pgvector.psycopg2 import register_vector
from psycopg2.extras import RealDictCursor

def _sentences(text: str) -> List[str]:
    parts = re.split(r'[.!?]\s+|\n+', text.strip())
    return [p.strip() for p in parts if len(p.strip()) >= 20]

def _cos(a: List[float], b: List[float]) -> float:
    num = sum(x*y for x,y in zip(a,b))
    da = math.sqrt(sum(x*x for x in a)); db = math.sqrt(sum(y*y for y in b))
    return 0.0 if da == 0 or db == 0 else num/(da*db)

def collect_memory_evidence(user_id: str, query: str, k: int = 5) -> List[Dict[str,Any]]:
    from app.embeddings import embed_texts
    from pgvector import Vector
    vec = embed_texts([query])[0]
    with conn_cursor(cursor_factory=RealDictCursor) as (conn, cur):
        register_vector(conn)
        cur.execute("""
            SELECT id, title, url, chunk
            FROM memory_semantic
            WHERE user_id = %s
            ORDER BY embedding <-> %s
            LIMIT %s
        """, (user_id, vec, k))
        rows = cur.fetchall()
    return rows

def grounding_score(answer: str, sources: List[str], memory_rows: List[Dict[str,Any]]) -> Tuple[float, Dict[str,Any]]:
    units = _sentences(answer)
    if not units:
        return 0.0, {"units": [], "evidence_used": []}
    evidence_texts = []
    for s in sources or []:
        if isinstance(s, str) and s.strip():
            evidence_texts.append(s.strip())
    for r in memory_rows or []:
        txt = (r.get("chunk") or "").strip()
        if txt:
            evidence_texts.append(txt)
    if not evidence_texts:
        return 0.0, {"units": units, "evidence_used": []}

    unit_vecs = embed_texts(units)
    ev_vecs = embed_texts(evidence_texts)

    best = []
    for u, uv in zip(units, unit_vecs):
        m = max((_cos(uv, ev) for ev in ev_vecs), default=0.0)
        best.append(m)

    score = sum(best)/len(best)
    meta = {
        "units": units,
        "per_unit_best": best,
        "evidence_used": evidence_texts[:8]  # return preview
    }
    return score, meta
