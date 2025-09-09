import { NextResponse } from 'next/server';
import { clearCookie } from '@/src/lib/session';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearCookie());
  return res;
}
