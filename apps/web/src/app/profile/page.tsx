'use client'
import { useState } from 'react'

type UpsertResp = {
  ok: boolean
  profile?: {
    user_id: string
    display_name: string | null
    prefs: Record<string, unknown>
  }
  detail?: string
}

export default function ProfilePage() {
  const [userId, setUserId] = useState('omari')
  const [displayName, setDisplayName] = useState('Omari')
  const [prefsText, setPrefsText] = useState('{"mode":"builder","theme":"dark"}')

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const parsePrefs = (s: string): Record<string, unknown> => {
    try {
      const obj = JSON.parse(s)
      // only accept objects
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return obj as Record<string, unknown>
      }
      throw new Error('prefs must be a JSON object')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON'
      throw new Error(msg)
    }
  }

  const submit = async () => {
    setLoading(true)
    setErr(null)
    setOkMsg(null)
    try {
      const prefs = parsePrefs(prefsText)
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memory/profile/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId.trim(),
          display_name: displayName.trim() || null,
          prefs,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data: UpsertResp = await r.json()
      if (!data.ok) throw new Error(data.detail ?? 'Upsert failed')
      setOkMsg(`Saved profile for ${data.profile?.user_id ?? userId}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">User ID</label>
        <input
          className="border p-2 w-full"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Display name</label>
        <input
          className="border p-2 w-full"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Prefs (JSON)</label>
        <textarea
          className="border p-2 w-full h-32 font-mono text-sm"
          value={prefsText}
          onChange={(e) => setPrefsText(e.target.value)}
          placeholder='{"mode":"builder","theme":"dark"}'
        />
        <p className="text-xs text-gray-500">
          Must be a valid JSON object. Examples: <code>{'{}'}</code>,{' '}
          <code>{"{\"mode\":\"builder\",\"theme\":\"dark\"}"}</code>
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading || !userId.trim()}
          className="border px-4 py-2"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>

      {okMsg && <div className="text-green-600 text-sm">✅ {okMsg}</div>}
      {err && <div className="text-red-600 text-sm">❌ {err}</div>}
    </main>
  )
}