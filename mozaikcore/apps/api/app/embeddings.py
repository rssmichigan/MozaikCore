import hashlib
from typing import List
EMBED_DIM = 1536
def _hash_to_vec(s: str) -> list[float]:
    h = hashlib.sha256(s.encode()).digest()
    base = list(h) * (EMBED_DIM // len(h) + 1)
    v = base[:EMBED_DIM]
    norm = sum(x*x for x in v) ** 0.5 or 1.0
    return [x / norm for x in v]
def embed_texts(texts: List[str]) -> List[List[float]]:
    return [_hash_to_vec(t) for t in texts]
