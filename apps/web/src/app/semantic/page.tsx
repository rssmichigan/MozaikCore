'use client'
import { useState } from 'react'

type R = { id:number; user_id:string; source:string; title:string|null; chunk:string }

export default function SemanticSearch() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string|null>(null)
  const [results, setResults] = useState<R[]>([])
  const run = async () => {
    if (!q.trim()) return
    setLoading(true); setErr(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memory/semantic/search?q=${encodeURIComponent(q)}&k=8`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setResults(Array.isArray(data.results) ? data.results : [])
   } catch (e: unknown) {
  const msg = e instanceof Error ? e.message : 'Search failed'
  setErr(msg)
  setResults([])
} finally {
  setLoading(false)
}
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Semantic Search</h1>
      <div className="flex gap-2">
        <input className="border p-2 flex-1" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search ingested text & URLs..." />
        <button className="border px-4 py-2" onClick={run} disabled={loading}>{loading?'Searching...':'Search'}</button>
      </div>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <div className="space-y-3">
        {results.map(r=>(
          <div key={r.id} className="p-3 rounded bg-gray-50">
            <div className="text-xs text-gray-500">{r.user_id} • {r.source}</div>
            <div className="font-semibold">{r.title ?? `Result ${r.id}`}</div>
            <div className="text-sm whitespace-pre-wrap">{r.chunk.slice(0,400)}{r.chunk.length>400?'…':''}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
