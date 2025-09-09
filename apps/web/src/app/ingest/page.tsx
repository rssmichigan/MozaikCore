'use client'
import Link from 'next/link'
import { useState } from 'react'

type IngestPayload =
  | { user_id: string; title?: string | null; text: string }
  | { user_id: string; url: string; title?: string | null }

export default function IngestPage() {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const post = async (
    path: '/api/ingest/text' | '/api/ingest/url',
    body: IngestPayload
  ) => {
    setLoading(true); setErr(null); setOk(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setOk(
        path === '/api/ingest/text'
          ? `Note ingested (id=${data.id ?? '…'})`
          : `URL ingested (id=${data.id ?? '…'})`
      )
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submit failed'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ingest</h1>
        <nav className="flex gap-4 text-sm underline">
          <Link href="/semantic">Semantic →</Link>
          <Link href="/settings">Settings →</Link>
        </nav>
      </header>

      {ok && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm">
          <div className="font-medium">✅ {ok}</div>
          <div className="mt-1">
            Continue to{' '}
            <Link className="underline" href="/semantic">
              Semantic Search
            </Link>
            .
          </div>
        </div>
      )}
      {err && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm">
          ⚠️ {err}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Ingest Text</h2>
        <textarea
          className="border p-2 w-full h-32"
          placeholder="Paste a note or snippet…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            disabled={loading || !text.trim()}
            onClick={() =>
              post('/api/ingest/text', { user_id: 'omari', title: 'note', text })
            }
            className="border px-4 py-2"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
          <button onClick={() => setText('')} className="text-sm underline">
            Clear
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Ingest URL</h2>
        <input
          className="border p-2 w-full"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            disabled={loading || !url.trim()}
            onClick={() =>
              post('/api/ingest/url', { user_id: 'omari', url, title: url })
            }
            className="border px-4 py-2"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
          <button onClick={() => setUrl('')} className="text-sm underline">
            Clear
          </button>
        </div>
      </section>
    </main>
  )
}