'use client'
import { useState } from 'react'
import Link from 'next/link'

type SearchResult = {
  id: number
  title: string | null
  url: string | null
  chunk: string
}

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])

  const run = async () => {
    if (!q.trim()) return
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(q)}&k=8`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setResults(Array.isArray(data.results) ? data.results : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Search failed'
      setError(msg)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Search Memory</h1>
        <Link href="/" className="underline text-sm">Home →</Link>
      </header>

      <form onSubmit={(ev)=>{ev.preventDefault();run()}} className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Ask Mozaik’s memory…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button type="submit" disabled={loading} className="border px-4 py-2">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">{error}</div>}

      <section className="space-y-3">
        {results.length === 0 && !loading && !error && (
          <p className="text-sm text-gray-500">
            No results yet. Try a query like <em>agentic assistant</em>.
          </p>
        )}
        {results.map((r) => (
          <article key={r.id} className="p-4 rounded border bg-white">
            <div className="text-xs text-gray-500 mb-1"># {r.id}</div>
            {r.url ? (
              <a href={r.url} target="_blank" className="font-medium underline break-all" rel="noreferrer">
                {r.title ?? r.url}
              </a>
            ) : (
              <div className="font-medium text-gray-800">Document {r.id}</div>
            )}
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">{r.chunk}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
