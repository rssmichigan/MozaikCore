from typing import Dict, Any, List, Tuple
from app.db import conn_cursor
from pgvector import Vector
from app.embeddings import embed_texts

def short_memory(user_id: str, limit: int = 8) -> List[Dict[str, Any]]:
    with conn_cursor() as (conn, cur):
        cur.execute("""
            SELECT id, event_type, summary, created_at
            FROM memory_episodic
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        """, (user_id, limit))
        rows = cur.fetchall()
    return [
        {"id": r[0], "type": r[1], "summary": r[2], "ts": r[3].isoformat()}
        for r in rows
    ]

def medium_memory(user_id: str, query: str, k: int = 5) -> List[Dict[str, Any]]:
    vec = embed_texts([query])[0]
    with conn_cursor() as (conn, cur):
        cur.execute("""
            SELECT id, source, title, chunk, created_at
            FROM memory_semantic
            WHERE user_id = %s
            ORDER BY embedding <-> %s
            LIMIT %s
        """, (user_id, Vector(vec), k))
        rows = cur.fetchall()
    return [
        {"id": r[0], "source": r[1], "title": r[2], "chunk": r[3], "ts": r[4].isoformat()}
        for r in rows
    ]

def long_memory(user_id: str) -> Dict[str, Any]:
    with conn_cursor() as (conn, cur):
        cur.execute("""
            SELECT display_name, prefs
            FROM memory_profiles
            WHERE user_id = %s
            LIMIT 1
        """, (user_id,))
        row = cur.fetchone()
    if not row:
        return {}
    return {"display_name": row[0], "prefs": row[1] or {}}

def get_context(user_id: str, query: str) -> Dict[str, Any]:
    short = short_memory(user_id)
    medium = medium_memory(user_id, query)
    long = long_memory(user_id)
    return {"short": short, "medium": medium, "long": long}

def render_context(ctx: Dict[str, Any]) -> str:
    lines: List[str] = []
    if ctx.get("long"):
        dn = ctx["long"].get("display_name")
        prefs = ctx["long"].get("prefs")
        lines.append("Long Memory (profile):")
        if dn: lines.append(f"- name: {dn}")
        if prefs: lines.append(f"- prefs: {prefs}")
        lines.append("")
    if ctx.get("short"):
        lines.append("Short Memory (recent events):")
        for e in ctx["short"]:
            lines.append(f"- [{e['ts']}] {e['type']}: {e['summary']}")
        lines.append("")
    if ctx.get("medium"):
        lines.append("Medium Memory (semantic recall):")
        for m in ctx["medium"]:
            title = m['title'] or m['source']
            snippet = (m['chunk'][:160] + "…") if len(m['chunk']) > 160 else m['chunk']
            lines.append(f"- {title}: {snippet}")
        lines.append("")
    return "\n".join(lines).strip()
