'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [msg, setMsg] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const send = async () => {
    const r = await fetch(process.env.NEXT_PUBLIC_API_URL + '/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'omari', message: msg })
    })
    const data = await r.json()
    setLogs(l => [...l, data.text]); setMsg('')
  }
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Mozaik</h1>
  <nav className="flex gap-4 text-sm underline">
    <Link href="/ingest">Ingest →</Link>
    <Link href="/settings">Settings →</Link>
    <Link href="https://buy.stripe.com/7sY28k74x31M9nEftc5wI00" target="_blank">
      <button className="border px-3 py-1 bg-blue-600 text-white rounded">
        Subscribe →
      </button>
    </Link>
  </nav>
</header>
      <div className="space-y-2">
        {logs.map((t,i)=>(<div key={i} className="p-3 rounded bg-gray-100">{t}</div>))}
      </div>
      <div className="flex gap-2">
        <input className="border p-2 flex-1" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ask Mozaik..." />
        <button onClick={send} className="border px-4 py-2">Send</button>
      </div>
    </main>
  )
}
