# Mozaik

Plan, research, and execute — with a small memory.

**Live web:** https://mozaikai.com  
**API:** Render (FastAPI) + Neon Postgres + pgvector  
**Storage:** Cloudflare R2

## Quick start (monorepo)

```bash
# web
cd apps/web
cp .env.local.example .env.local   # ensure NEXT_PUBLIC_API_URL points at your API
npm install
npm run dev    # http://localhost:3000

# api
cd ../api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>?sslmode=require
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
