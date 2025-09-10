import { NextRequest } from 'next/server'
import { clearCookie } from '@/lib/session'

export async function POST() {
  return clearCookie()
}

export async function GET() {
  return clearCookie()
}
