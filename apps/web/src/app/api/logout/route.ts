import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok:true })
  res.cookies.set('mz_uid', '', { path:'/', maxAge: 0 })
  res.cookies.set('mz_name', '', { path:'/', maxAge: 0 })
  return res
}
