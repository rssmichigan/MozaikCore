from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional
import httpx
from app.embeddings import embed_texts
from app.db import conn_cursor
from pgvector import Vector

router = APIRouter()

class IngestTextIn(BaseModel):
    user_id: str = "omari"
    title: Optional[str] = None
    text: str

@router.post("/ingest/text")
def ingest_text(payload: IngestTextIn):
    text = payload.text.strip()
    if not text:
        raise HTTPException(400, "empty text")
    vec = embed_texts([text])[0]
    with conn_cursor() as (conn, cur):
        cur.execute("""
            INSERT INTO memory_semantic (user_id, source, title, chunk, embedding)
            VALUES (%s,%s,%s,%s,%s)
            RETURNING id, title
        """, (payload.user_id, "note", payload.title, text, Vector(vec)))
        row = cur.fetchone()
    return {"ok": True, "id": row[0], "title": row[1]}

class IngestUrlIn(BaseModel):
    user_id: str = "omari"
    url: HttpUrl
    title: Optional[str] = None
    max_bytes: int = 12000

@router.post("/ingest/url")
def ingest_url(payload: IngestUrlIn):
    try:
        headers = {"User-Agent": "MozaikBot/0.1 (+https://mozaikai.com)"}
        r = httpx.get(str(payload.url), timeout=10.0, headers=headers, follow_redirects=True)
        r.raise_for_status()
    except Exception as e:
        raise HTTPException(400, f"fetch error: {e}")
    text = r.text
    if not text:
        raise HTTPException(400, "empty body")
    text = text[: payload.max_bytes]
    vec = embed_texts([text])[0]
    with conn_cursor() as (conn, cur):
        cur.execute("""
            INSERT INTO memory_semantic (user_id, source, title, chunk, embedding)
            VALUES (%s,%s,%s,%s,%s)
            RETURNING id, title
        """, (payload.user_id, "url", payload.title or str(payload.url), text, Vector(vec)))
        row = cur.fetchone()
    return {"ok": True, "id": row[0], "title": row[1]}


from fastapi import Query

@router.get("/memory/semantic/search")
def memory_semantic_search(q: str = Query(..., min_length=1), k: int = 5):
    vec = embed_texts([q])[0]
    with conn_cursor() as (conn, cur):
        cur.execute(
            """
            SELECT id, user_id, source, title, chunk
            FROM memory_semantic
            ORDER BY embedding <-> %s
            LIMIT %s
            """, (Vector(vec), k)
        )
        rows = cur.fetchall()
    return {"results": [
        {"id": r[0], "user_id": r[1], "source": r[2], "title": r[3], "chunk": r[4]}
        for r in rows
    ]}
