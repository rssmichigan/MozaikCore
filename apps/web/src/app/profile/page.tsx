'use client'
import { useState } from 'react'

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('Omari')
  const [theme, setTheme] = useState<'light'|'dark'>('dark')
  const [msg, setMsg] = useState<string| null>(null)
  const [err, setErr] = useState<string| null>(null)
  const [loading, setLoading] = useState(false)
  const api = process.env.NEXT_PUBLIC_API_URL

  const save = async () => {
    setLoading(true); setMsg(null); setErr(null)
    try {
      const r = await fetch(`${api}/api/memory/profile/upsert`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          user_id: 'omari',
          display_name: displayName,
          prefs: { theme }
        })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setMsg('Saved!')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally { setLoading(false) }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <label className="block text-sm">Display name</label>
      <input className="border p-2 w-full"
             value={displayName} onChange={e=>setDisplayName(e.target.value)} />
      <label className="block text-sm mt-3">Theme</label>
      <select className="border p-2 w-full"
              value={theme} onChange={e=>setTheme(e.target.value as any)}>
        <option value="dark">dark</option>
        <option value="light">light</option>
      </select>
      <div className="flex gap-2 mt-4">
        <button onClick={save} disabled={loading} className="border px-4 py-2">
          {loading ? 'Saving…' : 'Save'}
        </button>
        {msg && <div className="text-green-600 text-sm">{msg}</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}
      </div>
    </main>
  )
}
