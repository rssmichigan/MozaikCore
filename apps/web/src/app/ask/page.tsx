'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

export default function AskPage() {
  const [userId, setUserId] = useState('omari')
  const [query, setQuery]   = useState('launch a newsletter')
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState<string|null>(null)
  const [decision, setDecision] = useState<string>('')
  const [reasons, setReasons]   = useState<string[]>([])
  const [final, setFinal]       = useState<string>('')
  const [trace, setTrace]       = useState<any>(null)

  const ask = async () => {
    setLoading(true); setErr(null); setFinal(''); setDecision(''); setReasons([]); setTrace(null)
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, query }),
      })
      const j = await r.json()
      if (!r.ok || !j.ok) throw new Error(`HTTP ${r.status}`)
      setDecision(j.decision || '')
      setReasons(j.reasons || [])
      setFinal(j.final || '')
      setTrace(j.trace || null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ask failed'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ask Mozaik</h1>
      <div className="space-y-3">
        <div className="flex gap-2">
          <label className="text-sm w-24">User ID</label>
          <input className="border p-2 flex-1" value={userId} onChange={e=>setUserId(e.target.value)} />
        </div>
        <textarea
          className="border p-2 w-full h-28"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="What should we do next?"
        />
        <button
          onClick={ask}
          disabled={loading || !query.trim() || !userId.trim()}
          className="border px-4 py-2"
        >
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      {err && <div className="text-red-600 text-sm">❌ {err}</div>}

      {!!decision && (
        <div className="bg-gray-50 p-3 rounded text-sm">
          <div><span className="font-semibold">Reasoning:</span> {decision}</div>
          {reasons.length > 0 && (
            <ul className="list-disc ml-6">
              {reasons.map((r,i)=> <li key={i}>{r}</li>)}
            </ul>
          )}
        </div>
      )}

      {!!final && (
        <div className="space-y-2">
          <h2 className="font-semibold">Answer</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm">{final}</pre>
        </div>
      )}

      {!!trace && (
        <details className="bg-gray-50 p-3 rounded text-sm">
          <summary className="cursor-pointer">Tool trace</summary>
          <pre className="whitespace-pre-wrap">{JSON.stringify(trace, null, 2)}</pre>
        </details>
      )}
    </main>
  )
}
