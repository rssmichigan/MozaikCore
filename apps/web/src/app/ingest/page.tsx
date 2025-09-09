'use client'
import { useState } from 'react'

export default function IngestPage() {
  const [txt, setTxt] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<string>('')

  const sendText = async () => {
    setStatus(''); if (!txt.trim()) return
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingest/text`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user_id: 'omari', title: 'note', text: txt })
    })
    const d = await r.json()
    setStatus(r.ok ? `Text ingested (id=${d.id})` : `Error: ${d.detail || 'failed'}`)
  }

  const sendUrl = async () => {
    setStatus(''); if (!url.trim()) return
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingest/url`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user_id: 'omari', url })
    })
    const d = await r.json()
    setStatus(r.ok ? `URL ingested (id=${d.id})` : `Error: ${d.detail || 'failed'}`)
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ingest</h1>
      <section className="space-y-2">
        <textarea className="w-full border p-2 h-32" value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Paste text to ingest..." />
        <button onClick={sendText} className="border px-4 py-2">Ingest Text</button>
      </section>
      <section className="space-y-2">
        <input className="w-full border p-2" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://link-to-ingest" />
        <button onClick={sendUrl} className="border px-4 py-2">Ingest URL</button>
      </section>
      {status && <div className="p-2 bg-gray-100 rounded">{status}</div>}
    </main>
  )
}
