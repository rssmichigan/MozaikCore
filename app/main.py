from fastapi import FastAPI
from pydantic import BaseModel

from app.router import complete
from app.rag import add_documents

app = FastAPI(title="MozaikCore")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mozaikai.com",
        "https://www.mozaikai.com",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- Security guards ---
import re
from starlette.responses import PlainTextResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware

# 404 any requests for common secret/leak paths
BANNED = re.compile(
    r"(^/(\.env(\.example|\.bak|\.save(\.\d+)?)?|sendgrid\.env|twilio\.env|secrets\.env|\.config(\.yaml)?|phpinfo(\.php)?|info/|app_dev\.php|laravel/|admin/|backend/|web/|core/|images/))",
    re.IGNORECASE,
)

@app.middleware("http")
async def block_scanners(request, call_next):
    if BANNED.search(request.url.path):
        return PlainTextResponse("Not found", status_code=404)
    return await call_next(request)

# only accept requests for your expected hostnames
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "mozaikai.com", "www.mozaikai.com", "api.mozaikai.com",
        "*.onrender.com", "127.0.0.1", "localhost",
    ],
)
# ---------- /complete ----------
# very simple per-IP token bucket (20 req / 10s)
import time
from collections import defaultdict

_WINDOW, _LIMIT = 10, 20
_HITS = defaultdict(list)

@app.middleware("http")
async def rate_limit(request, call_next):
    ip = request.client.host
    now = time.time()
    _HITS[ip] = [t for t in _HITS[ip] if now - t < _WINDOW]
    if len(_HITS[ip]) >= _LIMIT:
        return PlainTextResponse("Too Many Requests", status_code=429)
    _HITS[ip].append(now)
    return await call_next(request)
class CompleteIn(BaseModel):
    task: str = "auto"            # general-first; router can auto-detect intent
    query: str
    privacy: str = "low"
    use_rag: bool = True
    system: str | None = None     # use union type; no typing.Optional import needed

@app.post("/complete")
def complete_api(req: CompleteIn):
    return complete(
        task=req.task,
        query=req.query,
        privacy=req.privacy,
        use_rag=req.use_rag,
        system=req.system
    )

# ---------- /ingest ----------

class DocIn(BaseModel):
    id: str
    text: str
    source: str | None = None
    # Accept either list or scalar; the RAG layer will coerce metadata to scalars
    tags: list[str] | str | None = None

class IngestIn(BaseModel):
    docs: list[DocIn]

@app.post("/ingest")
def ingest_api(payload: IngestIn):
    add_documents([d.model_dump() for d in payload.docs])
    return {"ok": True, "count": len(payload.docs)}

# ---------- /summarize ----------

class SummarizeIn(BaseModel):
    text: str
    privacy: str = "low"
    format: str | None = None     # again, no typing.Optional required

@app.post("/summarize")
def summarize_api(req: SummarizeIn):
    fmt = req.format or "5 concise bullet points and 3 action items"
    q = f"Summarize the following text into {fmt}.\n\nTEXT:\n{req.text}"
    return complete(task="summarize", query=q, privacy=req.privacy, use_rag=False)
from fastapi.staticfiles import StaticFiles
app.mount("/site", StaticFiles(directory="site"), name="site")
app.mount("/", StaticFiles(directory="site", html=True), name="root")  # keeps /docs working because it's added earlier
# in app/main.py
from starlette.responses import RedirectResponse

@app.middleware("http")
async def force_apex(request, call_next):
    host = request.headers.get("host", "")
    if host.lower().startswith("www."):
        url = str(request.url).replace("//www.", "//", 1)
        return RedirectResponse(url, status_code=301)
    return await call_next(request)