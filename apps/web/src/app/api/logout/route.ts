import { NextResponse } from 'next/server'
import { clearCookie } from '@/lib/session'

function doLogout() {
  const res = NextResponse.json({ ok: true })
  clearCookie(res)
  return res
}

export async function POST() {
  return doLogout()
}

export async function GET() {
  // So <a href="/api/logout">Sign out</a> also works
  return doLogout()
}
