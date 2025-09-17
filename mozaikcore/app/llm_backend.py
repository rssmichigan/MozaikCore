import os, time
from typing import List, Dict, Optional

DEFAULT_MODEL = os.getenv("GEN_MODEL", "gpt-4o-mini")
DEFAULT_TEMP  = float(os.getenv("GEN_TEMPERATURE", "0.3"))
DEFAULT_MAX_TOKENS = int(os.getenv("GEN_MAX_TOKENS", "320"))

_openai_client = None
def _get_openai():
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _openai_client

def generate(
    messages: List[Dict],
    *,
    model: str = "",
    temperature: float = DEFAULT_TEMP,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    timeout: int = 60
) -> str:
    client = _get_openai()
    for attempt in range(4):
        try:
            resp = client.chat.completions.create(
                model=model or DEFAULT_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception:
            if attempt == 3:
                raise
            time.sleep(0.6 * (2 ** attempt))
    return ""

def embed(texts: List[str], model: Optional[str] = None) -> List[List[float]]:
    client = _get_openai()
    mdl = model or os.getenv("EMBED_MODEL", "text-embedding-3-small")
    out: List[List[float]] = []
    for t in texts:
        r = client.embeddings.create(model=mdl, input=t)
        out.append(r.data[0].embedding)
    return out