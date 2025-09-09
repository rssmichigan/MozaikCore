'use client'
import { useEffect, useState } from 'react'

type StoreResp = { ok: boolean; key: string }
type ListResp = { ok: boolean; keys: string[] }

export default function ToolsPage() {
  const [text, setText] = useState('')
  const [loadingRun, setLoadingRun] = useState(false)
  const [runErr, setRunErr] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const [keys, setKeys] = useState<string[]>([])
  const [listErr, setListErr] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(false)

  const [selected, setSelected] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loadingGet, setLoadingGet] = useState(false)
  const [getErr, setGetErr] = useState<string | null>(null)

  // List objects from R2
  const refreshList = async () => {
    setLoadingList(true)
    setListErr(null)
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/r2/list`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data: ListResp = await r.json()
      setKeys(Array.isArray(data.keys) ? data.keys : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'List failed'
      setListErr(msg)
      setKeys([])
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    refreshList()
  }, [])

  // Run r2_store tool
  const run = async () => {
    if (!text.trim()) return
    setLoadingRun(true)
    setRunErr(null)
    setResult(null)
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
      const data: StoreResp = await r.json()
      setResult(data.key)
      setText('')
      // refresh list so the new object appears
      refreshList()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Tool run failed'
      setRunErr(msg)
    } finally {
      setLoadingRun(false)
    }
  }

  // Fetch and preview a key
  const fetchPreview = async (key: string) => {
    setSelected(key)
    setPreview(null)
    setGetErr(null)
    setLoadingGet(true)
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/r2/get?key=${encodeURIComponent(
          key
        )}`
      )
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      // The API returns text/plain for now; show as text
      const body = await r.text()
      setPreview(body)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Fetch failed'
      setGetErr(msg)
    } finally {
      setLoadingGet(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Tools</h1>
        <p className="text-sm text-gray-600">
          Store text to R2, then list and preview stored objects.
        </p>
      </header>

      {/* r2_store runner */}
      <section className="space-y-3">
        <h2 className="font-semibold">Store text to R2</h2>
        <textarea
          className="border p-2 w-full h-32"
          placeholder="Text to store in R2…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={run}
            disabled={loadingRun || !text.trim()}
            className="border px-4 py-2"
          >
            {loadingRun ? 'Running…' : 'Run r2_store'}
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
        {runErr && <div className="text-red-600 text-sm">❌ {runErr}</div>}
      </section>

      {/* list & preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Objects in bucket</h2>
          <button
            onClick={refreshList}
            disabled={loadingList}
            className="text-sm underline"
          >
            {loadingList ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {listErr && <div className="text-red-600 text-sm">❌ {listErr}</div>}

        {keys.length === 0 ? (
          <div className="text-sm text-gray-500">No objects yet.</div>
        ) : (
          <ul className="space-y-1">
            {keys.map((k) => (
              <li key={k}>
                <button
                  onClick={() => fetchPreview(k)}
                  className="text-blue-600 underline text-sm"
                >
                  {k}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">
              Preview: <code>{selected}</code>
            </div>
            {loadingGet ? (
              <div className="text-sm">Loading…</div>
            ) : getErr ? (
              <div className="text-red-600 text-sm">❌ {getErr}</div>
            ) : preview ? (
              <pre className="whitespace-pre-wrap border p-3 rounded bg-gray-50 text-sm">
                {preview}
              </pre>
            ) : (
              <div className="text-sm text-gray-500">No preview.</div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}