import os
from typing import List
from openai import OpenAI

EMBED_DIM = 1536  # text-embedding-3-small
_client = None

def _client_lazy():
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client

def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts: return []
    client = _client_lazy()
    resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
    return [d.embedding for d in resp.data]
