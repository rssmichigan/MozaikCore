
- Web sessions use a signed, httpOnly cookie `mz_sess` (HMAC-SHA256) with 8h TTL.
- Set **SESSION_SECRET** in `apps/web/.env.local` (and in Vercel/Render env as needed).
- Protected routes: `/tools`, `/profile` (via `middleware.ts`).
- API endpoints:
  - `POST /api/login` body: `{ "user_id": "omari" }` → sets cookie
  - `POST /api/logout` → clears cookie
  - `GET /api/whoami` → `{ user_id, exp }` or `{ user_id: null }`

*This is a lightweight scaffold for now; swap with real auth (OAuth/JWT) later.*
