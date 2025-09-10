from fastapi import FastAPI, Query
from app.memory import router as memory_router
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

# Optional Redis (fail-open if not configured)
try:
    from redis import Redis
except Exception:
    Redis = None

redis = None
REDIS_URL = os.getenv("REDIS_URL")
if Redis and REDIS_URL:
    try:
        redis = Redis.from_url(REDIS_URL, decode_responses=True)
    except Exception:
        redis = None

from app.embeddings import embed_texts
from app.db import conn_cursor
from pgvector import Vector
from app.db_init import ensure_schema
from app.tools.runtime import router as tools_router
from app.r2_endpoints import router as r2_router
from app.agents_endpoints import router as agents_router
from app.ingest_endpoints import router as ingest_router
from app.critic_endpoints import router as critic_router

app = FastAPI(title="Mozaik API", version="0.1")

# Allow local + prod origins
origins = [
    "http://localhost:3000",
    "https://mozaikai.com",
    "https://www.mozaikai.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatIn(BaseModel):
    user_id: str
    message: str

class ChatOut(BaseModel):
    text: str
    citations: List[str] = []

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/chat", response_model=ChatOut)
async def chat(inp: ChatIn):
    text = f"Hello, {inp.user_id}. You said: {inp.message}"
    return ChatOut(text=text, citations=[])

class IngestIn(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None

@app.post("/ingest")
async def ingest(inp: IngestIn):
    if not inp.url and not inp.text:
        return {"ok": False, "error": "Provide 'url' or 'text'."}

    # enqueue only if Redis is configured
    if redis is not None:
        try:
            job = {"type": "ingest", "url": inp.url, "text": inp.text}
            redis.lpush("mozaik:jobs", str(job))
        except Exception:
            pass  # fail-open if queue unavailable

    # synchronous persist with embeddings
    text_to_embed = (inp.text or "")[:8000]
    if text_to_embed:
        vec = embed_texts([text_to_embed])[0]
        with conn_cursor() as (conn, cur):
            cur.execute(
                "INSERT INTO documents (owner_id, title, url, chunk, embedding) VALUES (%s,%s,%s,%s,%s)",
                ("omari", None, inp.url, text_to_embed, Vector(vec)),
            )

    return {"ok": True, "queued": bool(redis)}

@app.get("/search")
async def search(q: str = Query(..., min_length=1), k: int = 5):
    vec = embed_texts([q])[0]
    with conn_cursor() as (conn, cur):
        cur.execute(
            """
            SELECT id, title, url, chunk
            FROM documents
            ORDER BY embedding <-> %s
            LIMIT %s
            """,
            (Vector(vec), k),
        )
        rows = cur.fetchall()
    return {"results": [{"id": r[0], "title": r[1], "url": r[2], "chunk": r[3]} for r in rows]}

app.include_router(memory_router, prefix='/api', tags=['memory'])


@app.on_event("startup")
def _startup_schema():
    try:
        ensure_schema()
    except Exception:
        # fail-open: keep app running, errors will show in logs
        pass

app.include_router(tools_router, prefix='/api', tags=['tools'])

app.include_router(r2_router, prefix='/api', tags=['r2'])

app.include_router(critic_router, prefix="/api", tags=["critic"])

app.include_router(ingest_router, prefix="/api", tags=["ingest"])

app.include_router(agents_router, prefix='/api', tags=['agents'])

@app.get("/api/agents/_ping")
def _agents_ping():
    return {"ok": True, "hint": "main.py is current and /api prefix works"}
