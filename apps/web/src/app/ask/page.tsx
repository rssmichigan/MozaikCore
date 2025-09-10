'use client'
import { useState } from 'react'

type AskResp = {
  ok?: boolean
  decision?: string
  reasons?: string[]
  final?: string
  factuality?: { score?: number|null; abstain?: boolean|null; warning?: string|null; forced?: boolean|null; details?: any }
  clarifying_questions?: string[]|null
  explanation?: string|null
  follow_up?: { suggestion?: string } | null
}

export default function AskPage() {
  const [q, setQ] = useState('')
  const [sourcesText, setSourcesText] = useState('') // one-per-line URLs or text
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string|null>(null)
  const [resp, setResp] = useState<AskResp | null>(null)

  const postAsk = async (body: any) => {
    setLoading(true); setErr(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setResp(data)
    } catch (e:any) {
      setErr(e?.message ?? 'Ask failed')
      setResp(null)
    } finally {
      setLoading(false)
    }
  }

  const onAsk = async () => {
    if (!q.trim()) return
    const sources = sourcesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    await postAsk({ user_id: 'omari', query: q, sources })
  }

  const onDeep = async () => {
    if (!q.trim()) return
    const sources = sourcesText.split('\n').map(s=>s.trim()).filter(Boolean)
    await postAsk({ user_id:'omari', query:q, sources, depth:'deep', selected_action:'deep' })
  }

  const onForce = async () => {
    if (!q.trim()) return
    const sources = sourcesText.split('\n').map(s=>s.trim()).filter(Boolean)
    await postAsk({ user_id:'omari', query:q, sources, force_best_effort:true, selected_action:'force' })
  }

  const badge = (() => {
    const s = resp?.factuality?.score
    const a = resp?.factuality?.abstain
    if (s == null) return null
    return (
      <span className={`inline-block text-xs px-2 py-0.5 rounded ${a ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
        Grounding: {s.toFixed(2)} {a ? '⚠️' : '✅'}
      </span>
    )
  })()

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ask Mozaik</h1>

      <textarea
        className="border p-2 w-full h-24"
        placeholder="What should I do next week? How do I launch a newsletter?…"
        value={q}
        onChange={e=>setQ(e.target.value)}
      />

      <details className="border rounded p-3">
        <summary className="cursor-pointer font-medium">Sources (optional)</summary>
        <p className="text-xs text-gray-500 mb-2">Paste URLs or text — one per line. This helps Mozaik verify answers.</p>
        <textarea
          className="border p-2 w-full h-28"
          placeholder="https://example.com/article-1\nPaste a paragraph of reference text…"
          value={sourcesText}
          onChange={e=>setSourcesText(e.target.value)}
        />
      </details>

      <div className="flex gap-2">
        <button disabled={loading || !q.trim()} onClick={onAsk} className="border px-4 py-2">
          {loading ? 'Thinking…' : 'Ask'}
        </button>
        <button disabled={loading || !q.trim()} onClick={onDeep} className="border px-3 py-2 text-sm">
          Deep (verify)
        </button>
        <button disabled={loading || !q.trim()} onClick={onForce} className="border px-3 py-2 text-sm">
          Best-effort
        </button>
      </div>

      {err && <div className="text-red-600 text-sm">❌ {err}</div>}

      {resp && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {badge}
            {resp?.explanation && <span className="text-xs text-gray-600">{resp.explanation}</span>}
          </div>

          {resp?.clarifying_questions?.length ? (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm space-y-2">
              <div className="font-medium text-amber-800">Before I answer:</div>
              <ul className="list-disc pl-5 text-amber-900">
                {resp.clarifying_questions.slice(0,3).map((q,i)=> <li key={i}>{q}</li>)}
              </ul>
              <div className="flex gap-2 pt-1">
                <button onClick={onDeep} className="underline">Run Deep</button>
                <button onClick={onForce} className="underline">Give Best-effort</button>
              </div>
            </div>
          ) : null}

          {resp?.factuality?.warning && (
            <div className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded p-2">
              {resp.factuality.warning}
            </div>
          )}

          {resp?.final && (
            <div className="whitespace-pre-wrap border rounded p-3 text-sm">
              {resp.final}
            </div>
          )}

          {resp?.reasons?.length ? (
            <div className="text-xs text-gray-500">
              Router: {resp?.decision} — {resp.reasons.join('; ')}
            </div>
          ) : null}
        </div>
      )}
    </main>
  )
}
