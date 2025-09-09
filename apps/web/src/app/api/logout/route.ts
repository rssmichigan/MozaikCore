import { NextResponse } from 'next/server'
import { clearCookie } from '@/lib/session'

// Allow sign-out via GET (browser link) or POST (form/fetch)
export async function GET() {
  const res = NextResponse.json({ ok: true })
  clearCookie(res)
  return res
}

export async function POST() {
  const res = NextResponse.json({ ok: true })
  clearCookie(res)
  return res
}