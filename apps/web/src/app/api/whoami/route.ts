import { cookies } from 'next/headers'

export async function GET() {
  const c = cookies()
  const uid = c.get('mz_uid')?.value || null
  const name = c.get('mz_name')?.value || null
  return new Response(JSON.stringify({ ok:true, user: uid ? { user_id: uid, display_name: name } : null }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
