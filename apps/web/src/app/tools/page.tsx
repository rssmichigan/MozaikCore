'use client'
import { useState } from 'react'

export default function ToolsPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (!text.trim()) return
    setLoading(true); setErr(null); setResult(null)
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tools/run/r2_store`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }
      )
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setResult(data.key)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Tool run failed'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Tools</h1>
      <textarea
        className="border p-2 w-full h-32"
        placeholder="Text to store in R2…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={run}
          disabled={loading || !text.trim()}
          className="border px-4 py-2"
        >
          {loading ? 'Running…' : 'Run r2_store'}
        </button>
        <button onClick={() => setText('')} className="text-sm underline">
          Clear
        </button>
      </div>
      {result && (
        <div className="text-green-600 text-sm">
          ✅ Stored to R2 at key: <code>{result}</code>
        </div>
      )}
      {err && <div className="text-red-600 text-sm">❌ {err}</div>}
    </main>
  )
}
