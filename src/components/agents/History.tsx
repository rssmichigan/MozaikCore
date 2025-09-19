'use client'
import { useEffect, useState } from "react"

type Run = { id: string; goal: string; createdAt: string }

export default function History({ onRerun }: { onRerun?: (goal: string) => void }) {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch("/api/agents")
      .then(r => r.ok ? r.json() : [])
      .then((data) => { if (alive) setRuns(Array.isArray(data) ? data : []) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  if (loading) return <div className="text-sm opacity-70">Loading history…</div>

  if (!runs.length) return <div className="text-sm opacity-70">No recent runs.</div>

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Recent runs</h2>
      <ul className="space-y-1">
        {runs.map((r) => (
          <li key={r.id} className="flex items-center gap-2 text-sm">
            <span className="opacity-60 w-44 shrink-0">
              {new Date(r.createdAt).toLocaleString()}
            </span>
            <span className="flex-1 truncate">{r.goal}</span>
            {onRerun && (
              <button
                className="border px-2 py-1 rounded"
                onClick={() => onRerun(r.goal)}
              >
                Rerun
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
