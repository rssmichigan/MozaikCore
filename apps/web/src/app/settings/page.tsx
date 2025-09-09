'use client'

import { useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Mode = 'builder' | 'researcher'

type Prefs = {
  theme: Theme
  mode: Mode
  notifications: boolean
}

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [prefs, setPrefs] = useState<Prefs>({
    theme: 'dark',
    mode: 'builder',
    notifications: true,
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const save = async () => {
    setSaving(true); setMsg(null); setErr(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memory/profile/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'omari',
          display_name: displayName || null,
          prefs,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setMsg('Saved ✓')
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Save failed'
      setErr(m)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500">
          These preferences are saved to your profile via the API.
        </p>
      </header>

      <section className="space-y-3">
        <label className="block text-sm font-semibold">Display name</label>
        <input
          className="border p-2 w-full"
          placeholder="Omari"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-semibold">Theme</label>
        <div className="flex gap-3 text-sm">
          {(['light','dark','system'] as Theme[]).map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                checked={prefs.theme === t}
                onChange={() => setPrefs(p => ({ ...p, theme: t }))}
              />
              {t}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-semibold">Mode</label>
        <div className="flex gap-3 text-sm">
          {(['builder','researcher'] as Mode[]).map((m) => (
            <label key={m} className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                checked={prefs.mode === m}
                onChange={() => setPrefs(p => ({ ...p, mode: m }))}
              />
              {m}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-semibold">Notifications</label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.notifications}
            onChange={(e) => setPrefs(p => ({ ...p, notifications: e.target.checked }))}
          />
          Enable basic notifications
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="border px-4 py-2"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {msg && <span className="text-green-700 text-sm">{msg}</span>}
        {err && <span className="text-red-600 text-sm">❌ {err}</span>}
      </div>

      <hr className="my-6" />

      <p className="text-xs text-gray-500">
        API: <code>/api/memory/profile/upsert</code> with <code>user_id="omari"</code>.
      </p>
    </main>
  )
}