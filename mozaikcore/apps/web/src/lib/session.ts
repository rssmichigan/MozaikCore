import crypto from 'crypto';

const NAME = 'mz_sess';
const TTL_MS = 1000 * 60 * 60 * 8; // 8h default

function secret() {
  const k = process.env.SESSION_SECRET;
  if (!k) throw new Error('SESSION_SECRET is not set');
  return k;
}

function sign(value: string) {
  const mac = crypto.createHmac('sha256', secret()).update(value).digest('base64url');
  return `${value}.${mac}`;
}

function verify(signed: string) {
  const i = signed.lastIndexOf('.');
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const mac = signed.slice(i + 1);
  const expected = crypto.createHmac('sha256', secret()).update(value).digest('base64url');
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected)) ? value : null;
}

export type Sess = { uid: string; exp: number };

export function makeCookie(uid: string, maxAgeMs = TTL_MS) {
  const payload: Sess = { uid, exp: Date.now() + maxAgeMs };
  const raw = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signed = sign(raw);
  const secure = process.env.NODE_ENV === 'production';
  // httpOnly, secure, strict SameSite, site path
  const cookie = `${NAME}=${signed}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(
    maxAgeMs / 1000
  )}${secure ? '; Secure' : ''}`;
  return cookie;
}

export function clearCookie() {
  const secure = process.env.NODE_ENV === 'production';
  return `${NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

export function readSessFromCookies(cookies: Record<string, string> | string | undefined): Sess | null {
  if (!cookies) return null;
  const raw =
    typeof cookies === 'string'
      ? cookies
      : Object.entries(cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
  const m = raw.match(new RegExp(`${NAME}=([^;]+)`));
  if (!m) return null;
  const ok = verify(m[1]);
  if (!ok) return null;
  try {
    const json = JSON.parse(Buffer.from(ok, 'base64url').toString('utf8')) as Sess;
    if (!json?.uid || !json?.exp || Date.now() > json.exp) return null;
    return json;
  } catch {
    return null;
  }
}
