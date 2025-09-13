from typing import List, Dict
import os, json
import chromadb

from app.llm_backend import embed as _embed

EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")

class OpenAIEmbeddingFunction:
    def __init__(self, model: str):
        self.model = model
    def __call__(self, input: List[str]) -> List[List[float]]:
        return _embed(input, model=self.model)


os.makedirs("data/chroma", exist_ok=True)
client = chromadb.PersistentClient(path="data/chroma")
collection = client.get_or_create_collection(
    name="mozaik",
    embedding_function=OpenAIEmbeddingFunction(EMBED_MODEL),
    metadata={"hnsw:space": "cosine"},
)

def _to_scalar(v):
    if v is None or isinstance(v, (str, int, float, bool)):
        return v
    if isinstance(v, list):
        return ", ".join(map(str, v[:8])) 
    if isinstance(v, (dict, tuple, set)):
        try:
            return json.dumps(v, ensure_ascii=False)
        except Exception:
            return str(v)
    return str(v)

def add_documents(docs: List[Dict]):
    ids, texts, metas = [], [], []
    for d in docs:
        ids.append(str(d["id"]))
        texts.append(d.get("text", ""))
        raw = {"source": d.get("source", "")}
        if "tags" in d:
            raw["tags"] = d.get("tags")
        metas.append({k: _to_scalar(v) for k, v in raw.items()})
    collection.add(ids=ids, documents=texts, metadatas=metas)

def retrieve(query: str, k: int = 3) -> List[Dict]:
    res = collection.query(query_texts=[query], n_results=k)
    docs  = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    ids   = res.get("ids", [[]])[0]
    out: List[Dict] = []
    for i in range(min(len(ids), len(docs), len(metas))):
        out.append({"id": ids[i], "text": docs[i], "meta": metas[i]})
    return out

def build_context(chunks: List[Dict]) -> str:
    if not chunks:
        return ""
    lines = []
    for c in chunks:
        cid = c.get("id", "")
        txt = c.get("text", "")
        src = (c.get("meta") or {}).get("source", "")
        head = f"[{cid}]" + (f" ({src})" if src else "")
        lines.append(f"{head} {txt}")
    return "\n\n".join(lines)