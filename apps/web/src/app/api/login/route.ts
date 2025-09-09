import { NextRequest, NextResponse } from 'next/server';
import { makeCookie } from '@/src/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const uid = (body?.user_id as string) || 'omari';
  const res = NextResponse.json({ ok: true, user_id: uid });
  res.headers.set('Set-Cookie', makeCookie(uid));
  return res;
}
