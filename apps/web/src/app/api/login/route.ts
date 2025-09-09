import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { user_id, display_name } = await req.json()
    const uid = String(user_id || '').trim()
    if (!uid) return NextResponse.json({ ok:false, error:'user_id required' }, { status: 400 })
    const res = NextResponse.json({ ok:true, user:{ user_id: uid, display_name: display_name || null }})
    // simple, non-HttpOnly scaffold so the client can read it (we can harden later)
    res.cookies.set('mz_uid', uid, { path: '/', sameSite: 'lax' })
    if (display_name) res.cookies.set('mz_name', String(display_name), { path: '/', sameSite: 'lax' })
    return res
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? 'bad request' }, { status: 400 })
  }
}
