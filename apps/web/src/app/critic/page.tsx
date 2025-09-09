'use client'
import { useState } from 'react'

type Critique = { score: number; accept: boolean; reason: string }

export default function CriticPage() {
  const [answer, setAnswer] = useState('')
  const [sourcesRaw, setSourcesRaw] = useState('["https://example.com"]')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<Critique | null>(null)

  const run = async () => {
    setErr(null); setResult(null)
    let sources: string[] = []
    try {
      const parsed = JSON.parse(sourcesRaw)
      if (!Array.isArray(parsed) || parsed.some(x => typeof x !== 'string')) {
        throw new Error('sources must be a JSON array of strings')
      }
      sources = parsed
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid sources JSON'
      setErr(msg); return
    }

    if (!answer.trim()) { setErr('Answer is required'); return }

    setLoading(true)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/critic/eval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, sources })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data: Critique = await r.json()
      setResult(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Critic failed'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Answer Critic</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Answer</label>
        <textarea
          className="border p-2 w-full h-28"
          placeholder='The total is 42. Source: https://example.com'
          value={answer}
          onChange={e=>setAnswer(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Sources (JSON array of strings)</label>
        <textarea
          className="border p-2 w-full h-20 font-mono"
          value={sourcesRaw}
          onChange={e=>setSourcesRaw(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Example: <code>["https://example.com","https://foo.bar"]</code>
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={run} disabled={loading} className="border px-4 py-2">
          {loading ? 'Evaluating…' : 'Evaluate'}
        </button>
        <button onClick={()=>{ setAnswer(''); setSourcesRaw('["https://example.com"]'); setErr(null); setResult(null); }} className="text-sm underline">
          Clear
        </button>
      </div>

      {result && (
        <div className="p-3 rounded bg-green-50 border border-green-200 text-sm">
          <div><b>Score:</b> {result.score.toFixed(2)}</div>
          <div><b>Accept:</b> {result.accept ? 'true' : 'false'}</div>
          <div><b>Reason:</b> {result.reason}</div>
        </div>
      )}
      {err && <div className="text-red-600 text-sm">❌ {err}</div>}
    </main>
  )
}
