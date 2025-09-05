'use client'
import { useState } from 'react'

export default function Ingest() {
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState('')
  const send = async () => {
    const r = await fetch(process.env.NEXT_PUBLIC_API_URL + '/ingest', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ url: url || undefined, text: msg || undefined })
    })
    const data = await r.json()
    alert(JSON.stringify(data))
    setUrl(''); setMsg('')
  }
  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ingest</h1>
      <input className="border p-2 w-full" placeholder="https://example.com (optional)"
             value={url} onChange={e=>setUrl(e.target.value)} />
      <textarea className="border p-2 w-full h-32" placeholder="or paste text..."
             value={msg} onChange={e=>setMsg(e.target.value)} />
      <button onClick={send} className="border px-4 py-2">Queue Ingest</button>
    </main>
  )
}
