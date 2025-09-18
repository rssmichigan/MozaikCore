"use client"
import { useState } from "react"

const MODELS = [
  { label: "Nano (cheap/fast)", value: "gpt-5-nano", outPerM: 0.40 },
  { label: "Mini (stronger)", value: "gpt-5-mini", outPerM: 0.80 }
]

function estimateCost(output: string, outPerM: number) {
  const chars = (output || "").length
  const tokens = Math.ceil(chars / 4)
  const cost = (tokens / 1_000_000) * outPerM
  return { tokens, cost }
}

export default function RunTask(){
  const [goal,setGoal]=useState("")
  const [purpose,setPurpose]=useState("")
  const [scope,setScope]=useState("")
  const [model,setModel]=useState("gpt-5-nano")
  const [out,setOut]=useState<any[]>([])
  const [err,setErr]=useState("")

  async function run(){
    setErr("")
    const r = await fetch("/api/agents", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ goal, model, purpose, scope })
    })
    if(!r.ok){ setErr(`Request failed (${r.status})`); return }
    const data = await r.json()
    setOut(data)
  }

  const totalOut = Array.isArray(out) ? out.map((x:any)=>x?.content ?? "").join("\n") : ""
  const perM = MODELS.find(m=>m.value===model)?.outPerM ?? 0.40
  const est = estimateCost(totalOut, perM)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <select className="border p-2 rounded" value={model} onChange={e=>setModel(e.target.value)}>
          {MODELS.map(m=>(<option key={m.value} value={m.value}>{m.label}</option>))}
        </select>
        <input className="border p-2 rounded w-40" placeholder="purpose" value={purpose} onChange={e=>setPurpose(e.target.value)}/>
        <input className="border p-2 rounded w-40" placeholder="scope" value={scope} onChange={e=>setScope(e.target.value)}/>
        <input
          className="border p-2 rounded flex-1"
          placeholder="Agent task (e.g., research pricing)"
          value={goal}
          onChange={e=>setGoal(e.target.value)}
        />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={run}>Run</button>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      {Array.isArray(out) && out.length>0 && (
        <div className="text-sm opacity-75">
          Estimated output cost: ~${est.cost.toFixed(4)} ({est.tokens} tokens; {model})
        </div>
      )}

      <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
        {JSON.stringify(out, null, 2)}
      </pre>
    </div>
  )
}
