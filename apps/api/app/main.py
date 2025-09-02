from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from redis import Redis
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
    return {"ok": True, "queued": True}
