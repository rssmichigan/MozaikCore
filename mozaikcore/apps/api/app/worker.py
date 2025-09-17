import os, ast
from redis import Redis
import httpx

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis = Redis.from_url(REDIS_URL, decode_responses=True)

def normalize_url(u: str | None) -> str | None:
    if not u:
        return None
    u = u.strip()
    if not u.lower().startswith(("http://", "https://")):
        u = "https://" + u
    return u

def process_ingest(job: dict):
    url = normalize_url(job.get("url"))
    text = job.get("text")
    if url:
        try:
            headers = {"User-Agent": "MozaikBot/0.1 (+https://mozaik.ai)"}
            r = httpx.get(url, timeout=10.0, headers=headers, follow_redirects=True)
            print(f"[worker] fetched {url} (status={r.status_code}, len={len(r.text)})")
        except Exception as e:
            print(f"[worker] error fetching {url}: {e}")
    if text:
        print(f"[worker] received text (len={len(text)})")

def main():
    print("[worker] Mozaik worker online. Waiting for jobs...")
    while True:
        _, payload = redis.brpop("mozaik:jobs")  # blocks until a job arrives
        try:
            job = ast.literal_eval(payload)
        except Exception as e:
            print(f"[worker] bad payload: {payload} ({e})")
            continue
        t = job.get("type")
        if t == "ingest":
            process_ingest(job)
        else:
            print(f"[worker] unknown job type: {t}")

if __name__ == "__main__":
    main()
