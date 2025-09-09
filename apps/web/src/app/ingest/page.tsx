'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function IngestPage() {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const post = async (path: '/api/ingest/text' | '/api/ingest/url', body: any) => {
    setLoading(true); setMsg(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setMsg(`✅ Ingested (id=${data.id || 'ok'}) — ready to search.`)
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Ingest failed'
      setMsg(`❌ ${m}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Ingest</h1>
        <p className="text-sm text-gray-500">Add notes or URLs to Mozaik’s memory.</p>
      </header>

      {msg && (
        <div className="rounded border p-3 bg-gray-50 flex items-center justify-between">
          <span className="text-sm">{msg}</span>
          <Link href="/semantic" className="underline text-sm">View in Semantic →</Link>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Ingest Text</h2>
        <textarea
          className="border p-2 w-full h-32"
          placeholder="Paste a note or snippet…"
          value={text}
          onChange={e=>setText(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            disabled={loading || !text.trim()}
            onClick={() => post('/api/ingest/text', { user_id: 'omari', title: 'note', text })}
            className="border px-4 py-2"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
          <button onClick={()=>setText('')} className="text-sm underline">Clear</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Ingest URL</h2>
        <input
          className="border p-2 w-full"
          placeholder="https://example.com"
          value={url}
          onChange={e=>setUrl(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            disabled={loading || !url.trim()}
            onClick={() => post('/api/ingest/url', { user_id: 'omari', url, title: url })}
            className="border px-4 py-2"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
          <button onClick={()=>setUrl('')} className="text-sm underline">Clear</button>
        </div>
      </section>
    </main>
  )
}
