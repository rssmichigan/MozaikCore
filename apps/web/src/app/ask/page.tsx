'use client'

import { useState } from 'react'

export default function AskPage() {
  const [query, setQuery] = useState('')
  const [depth, setDepth] = useState<'normal' | 'deep'>('normal')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  const run = async () => {
    if (!query.trim()) return
    setLoading(true)
    setErr(null)
    setData(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'omari', query, depth }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = await r.json()
      setData(j)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ask failed'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ask Mozaik</h1>

      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything…"
        />
        <button
          className="border px-4 py-2"
          onClick={run}
          disabled={loading}
        >
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      {data?.final && (
        <div className="p-3 rounded bg-gray-50 whitespace-pre-wrap">
          {data.final}
        </div>
      )}

      {/* 🔽 New grounding display */}
      {data?.factuality && (
        <div className="text-sm">
          <span
            className={
              data.factuality.abstain ? 'text-amber-600' : 'text-green-600'
            }
          >
            Grounding: {data.factuality.score.toFixed(2)}{' '}
            {data.factuality.abstain ? '⚠️' : '✅'}
          </span>
          {data.factuality.warning && (
            <div className="text-amber-600 mt-1">{data.factuality.warning}</div>
          )}
          {data.follow_up?.suggestion && (
            <button
              className="underline"
              onClick={() => setDepth('deep')}
            >
              {data.follow_up.suggestion}
            </button>
          )}
        </div>
      )}
    </main>
  )
}