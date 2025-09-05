from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from redis import Redis
from app.embeddings import embed_texts
from app.db import conn_cursor
import os

app = FastAPI(title="Mozaik API", version="0.1")

# CORS for local web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection (queue)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis = Redis.from_url(REDIS_URL, decode_responses=True)

class ChatIn(BaseModel):
    user_id: str
    message: str

class ChatOut(BaseModel):
    text: str
    citations: list[str] = []

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/chat", response_model=ChatOut)
async def chat(inp: ChatIn):
    text = f"Hello, {inp.user_id}. You said: {inp.message}"
    return ChatOut(text=text, citations=[])

# ---------- Ingest ----------
class IngestIn(BaseModel):
    url: str | None = None
    text: str | None = None

@app.post("/ingest")
async def ingest(inp: IngestIn):
    if not inp.url and not inp.text:
        return {"ok": False, "error": "Provide 'url' or 'text'."}
    job = {"type": "ingest", "url": inp.url, "text": inp.text}
    redis.lpush("mozaik:jobs", str(job))
    # persist text/url with embedding
    text_to_embed = (inp.text or "")[:8000]
    if text_to_embed:
        vec = embed_texts([text_to_embed])[0]
        with conn_cursor() as (conn, cur):
            cur.execute("INSERT INTO documents (owner_id, title, url, chunk, embedding) VALUES (%s,%s,%s,%s,%s)",
                        ("omari", None, inp.url, text_to_embed, vec))
    return {"ok": True, "queued": True}


from fastapi import Query
from typing import List, Dict

@app.get("/search")
async def search(q: str = Query(..., min_length=1), k: int = 5):
    vec = embed_texts([q])[0]
    # cosine distance in pgvector: 1 - cosine_similarity
    with conn_cursor() as (conn, cur):
        cur.execute("""
SELECT id, title, url, chunk
FROM documents
ORDER BY embedding <-> %s
LIMIT %s
""", (vec, k))
        rows = cur.fetchall()
    return {"results": [{"id": r[0], "title": r[1], "url": r[2], "chunk": r[3]} for r in rows]}
