"use client"
import { useEffect, useState } from "react"
type Item = { id: string; key: string; value: string }

export default function MemoryPanel() {
  const [items, setItems] = useState<Item[]>([])
  const [keyV, setKeyV] = useState("")
  const [valV, setValV] = useState("")
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  async function refresh() {
    setLoading(true); setErr("")
    const r = await fetch("/api/memory")
    if (!r.ok) { setErr("Failed to load"); setLoading(false); return }
    setItems(await r.json()); setLoading(false)
  }
  useEffect(()=>{ refresh() },[])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="border p-2 rounded w-40" placeholder="key"
               value={keyV} onChange={e=>setKeyV(e.target.value)} />
        <input className="border p-2 rounded flex-1" placeholder="value"
               value={valV} onChange={e=>setValV(e.target.value)} />
        <button className="px-3 py-2 rounded bg-black text-white"
                onClick={async ()=>{
                  if (!keyV.trim()) return
                  await fetch("/api/memory", {
                    method:"POST",
                    headers:{ "Content-Type":"application/json" },
                    body: JSON.stringify({ key: keyV.trim(), value: valV })
                  })
                  setKeyV(""); setValV(""); refresh()
                }}>
          Save
        </button>
      </div>

      {loading ? <div>Loading…</div> : err ? <div className="text-red-600">{err}</div> : (
        <ul className="divide-y">
          {items.map(i=>(
            <li key={i.id} className="py-2">
              <b>{i.key}</b>: {i.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}