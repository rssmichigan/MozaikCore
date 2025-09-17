"use client"
import { useState } from "react"

export default function RunTask(){
  const [goal,setGoal]=useState("")
  const [out,setOut]=useState<any[]>([])
  const [err,setErr]=useState("")

  async function run(){
    setErr("")
    const r = await fetch("/api/agents", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ goal })
    })
    if(!r.ok){ setErr("Request failed"); return }
    setOut(await r.json())
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="border p-2 rounded flex-1" placeholder="Agent task (e.g., research pricing)"
               value={goal} onChange={e=>setGoal(e.target.value)}/>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={run}>Run</button>
      </div>
      {err && <div className="text-red-600">{err}</div>}
      <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">{JSON.stringify(out,null,2)}</pre>
    </div>
  )
}