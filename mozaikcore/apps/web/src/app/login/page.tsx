'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [user_id, setUser] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  const go = async () => {
    setMsg(null); setLoading(true)
    try {
      const r = await fetch('/api/login', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ user_id, display_name: name || undefined })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setMsg('Signed in. Refresh or navigate to try features with your ID.')
    } catch (e:any) {
      setMsg(e?.message ?? 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <input className="border p-2 w-full" placeholder="user_id (e.g., omari)"
        value={user_id} onChange={e=>setUser(e.target.value)} />
      <input className="border p-2 w-full" placeholder="display name (optional)"
        value={name} onChange={e=>setName(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={!user_id.trim() || loading} onClick={go} className="border px-4 py-2">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <form action="/api/logout" method="POST">
          <button className="text-sm underline">Sign out</button>
        </form>
      </div>
      {msg && <div className="text-sm">{msg}</div>}
      <p className="text-xs text-gray-500">This is a simple session scaffold using cookies.</p>
    </main>
  )
}
