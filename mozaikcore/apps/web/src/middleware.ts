import { NextResponse, NextRequest } from 'next/server';
import { readSessFromCookies } from '@/lib/session'

const PROTECTED = new Set(['/tools', '/profile']);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PROTECTED.has(pathname)) {
    const sess = readSessFromCookies(req.headers.get('cookie') || undefined);
    if (!sess) {
      const url = new URL('/login', req.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/tools', '/profile'],
};
