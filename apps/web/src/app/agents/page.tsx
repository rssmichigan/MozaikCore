'use client'
import { useEffect, useState } from 'react'

type Agent = { name: string; desc: string }

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agents/list`, { cache: 'no-store' })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        setAgents(data.agents || [])
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to load agents')
      }
    }
    run()
  }, [])

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mozaik Agent Body</h1>
      <p className="text-gray-600">
        Mozaik auto-routes your question. You don’t pick an agent — Mozaik does.
      </p>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="space-y-2">
        {agents.map((a) => (
          <div key={a.name} className="border rounded p-3">
            <div className="font-semibold">{a.name}</div>
            <div className="text-sm text-gray-600">{a.desc}</div>
          </div>
        ))}
      </div>

      <div className="pt-2 text-sm">
        Try it: <a className="underline" href="/ask">Ask Mozaik</a> — it will plan/search/cohere automatically.
      </div>
    </main>
  )
}
