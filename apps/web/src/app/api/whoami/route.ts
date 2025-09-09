import { NextRequest, NextResponse } from 'next/server';
import { readSessFromCookies } from '@/src/lib/session';

export async function GET(req: NextRequest) {
  const sess = readSessFromCookies(req.headers.get('cookie') || undefined);
  if (!sess) return NextResponse.json({ user_id: null }, { status: 200 });
  return NextResponse.json({ user_id: sess.uid, exp: sess.exp }, { status: 200 });
}
