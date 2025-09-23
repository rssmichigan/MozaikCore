'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useEffect } from "react";const MODELS = [
import { useSession } from "next-auth/react"
  { label: "Nano (cheap/fast)", value: "gpt-5-nano", outPerM: 0.40 },
  { label: "Mini (stronger)", value: "gpt-5-mini", outPerM: 0.80 },
]

export default function RunTask(){
  const { data: sData, status: sStatus } = useSession()
  useEffect(() => { if (sStatus !== 'authenticated') setOut([]) }, [sStatus]);
  const [model,setModel]=useState("gpt-5-nano")
  const [mode,setMode]=useState<'research'|'agents'|'scaffold'>('research')
  const [prompt,setPrompt]=useState("")
  const [out,setOut]=useState<any[]>([])
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState<string>("")

  async function run(){
    if(!prompt.trim()) return
    setErr(""); setLoading(true)
    const goal = mode==='research' ? prompt : `apply agents: ${prompt}`
    const r = await fetch("/api/agents",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ goal, model, mode: mode })
    })
    if(!r.ok){
      setErr(`Request failed (${r.status})`)
      setOut([])
    }else{
      const data = await r.json()
      setOut(Array.isArray(data)?data:[])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-xl border overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm ${mode==='research'?'bg-black text-white':'bg-white'}`}
            onClick={()=>setMode('research')}
            type="button"
          >Research</button>
          <button
            className={`px-3 py-1.5 text-sm ${mode==='agents'?'bg-black text-white':'bg-white'}`}
            onClick={()=>setMode('agents')}
            type="button"
          >Apply agents</button>
          <button
            className={`px-3 py-1.5 text-sm ${mode==='scaffold'?'bg-black text-white':'bg-white'}`}
            onClick={()=>setMode('scaffold')}
            type="button"
          >Scaffold</button>
        </div>
        <select className="border rounded-xl px-2 py-1.5 text-sm" value={model} onChange={e=>setModel(e.target.value)}>
          {MODELS.map(m=>(<option key={m.value} value={m.value}>{m.label}</option>))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded-xl flex-1 px-3 py-2"
          placeholder={"Ask Mozaik…"}
          value={prompt}
          onChange={e=>setPrompt(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter' && (e.metaKey||e.ctrlKey)) run() }}
        />
        <button className="btn btn-primary" onClick={run} disabled={loading}>
          {loading?'Running…':'Run'}
        </button>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      {Array.isArray(out) && out.length > 0 && (
  (() => {
    const reply = out.find((r:any)=> r?.role === 'reply' || r?.role === 'synth');
    const display = reply ? (reply.content ?? '') : (typeof out[0] === 'string' ? out[0] : JSON.stringify(out, null, 2));
    return (
      <div className="card p-3 text-sm space-y-2">
        <div className="flex justify-end">
          <button className="text-xs border px-2 py-1 rounded" onClick={() => navigator.clipboard.writeText(display)}>Copy</button>
        </div>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{display}</ReactMarkdown>
        </div>
      </div>
    );
  })()
)}
    </div>
  )
}
