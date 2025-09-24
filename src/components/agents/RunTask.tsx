'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react"

const MODELS = [
  { label: "Nano (cheap/fast)", value: "gpt-5-nano", outPerM: 0.40 },
  { label: "Mini (stronger)", value: "gpt-5-mini", outPerM: 0.80 },
]

export default function RunTask(){
  const { data: sData, status: sStatus } = useSession()
  const [model,setModel]   = useState("gpt-5-nano")
  const [mode,setMode]     = useState<'research'|'agents'|'scaffold'>('research')
  const [prompt,setPrompt] = useState("")
  const [out,setOut]       = useState<any[]>([])
  const [loading,setLoading]=useState(false)
  const [err,setErr]       = useState<string>("")
  const [toast,setToast]   = useState<string>("")      // brief success feedback
  const [expanded,setExpanded] = useState(false)       // long content toggle
  const lastSubmit = useRef<number>(0)                 // debounce

  // Clear results when logging out (privacy)
  useEffect(() => { if (sStatus !== 'authenticated') setOut([]) }, [sStatus])

  async function run(){
    // Debounce: ignore if a run happened < 600ms ago
    const now = Date.now()
    if (now - lastSubmit.current < 600) return
    lastSubmit.current = now

    if(!prompt.trim()) return
    setErr(""); setToast(""); setLoading(true)

    const goal = mode==='research' ? prompt : `apply agents: ${prompt}`
    const r = await fetch("/api/agents",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ goal, model, mode }) // send mode directly
    })

    if(!r.ok){
      setErr(`Request failed (${r.status})`)
      setOut([])
    }else{
      const data = await r.json()
      setOut(Array.isArray(data)?data:[])
      setPrompt("")                // clear after successful render
      setToast("Done ✓")           // quick visual confirm
      setTimeout(()=>setToast(""), 1500)
    }
    setLoading(false)
  }

  // Helper to copy + feedback
  async function copyText(text: string){
    try {
      await navigator.clipboard.writeText(text)
      setToast("Copied ✓")
      setPrompt("")                // optional: also clear after copy
      setTimeout(()=>setToast(""), 1200)
    } catch {
      setErr("Copy failed — you can select and copy manually.")
      setTimeout(()=>setErr(""), 2500)
    }
  }

  // a11y live region for status messages
  const Live = () => (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {toast || err}
    </div>
  )

  // Render
  return (
    <div className="space-y-3">
      <Live />

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-xl border overflow-hidden">
          <button className={`px-3 py-1.5 text-sm ${mode==='research'?'bg-black text-white':'bg-white'}`} onClick={()=>setMode('research')} type="button">Research</button>
          <button className={`px-3 py-1.5 text-sm ${mode==='agents'?'bg-black text-white':'bg-white'}`}   onClick={()=>setMode('agents')}   type="button">Apply agents</button>
          <button className={`px-3 py-1.5 text-sm ${mode==='scaffold'?'bg-black text-white':'bg-white'}`} onClick={()=>setMode('scaffold')} type="button">Scaffold</button>
        </div>
        <select className="border rounded-xl px-2 py-1.5 text-sm" value={model} onChange={e=>setModel(e.target.value)}>
          {MODELS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded-xl flex-1 px-3 py-2"
          placeholder="Ask Mozaik…"
          value={prompt}
          onChange={e=>setPrompt(e.target.value)}
          onKeyDown={e=>{ if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) run() }}
          aria-label="Ask Mozaik"
        />
        <button className="btn btn-primary" onClick={run} disabled={loading}>
          {loading ? 'Running…' : 'Run'}
        </button>
      </div>

      {!!toast && <div className="text-xs text-emerald-700">{toast}</div>}
      {!!err &&   <div className="text-sm text-red-600">{err}</div>}

      {/* Results */}
      {Array.isArray(out) && out.length > 0 && (() => {
        const reply   = out.find((r:any)=> r?.role === 'reply' || r?.role === 'synth');
        const display = reply ? (reply.content ?? '') :
                         (typeof out[0] === 'string' ? out[0] : JSON.stringify(out, null, 2));

        // Performance guard: collapse very large outputs
        const TOO_LARGE = display.length > 120_000
        const shown = TOO_LARGE && !expanded ? display.slice(0, 60_000) + "\n\n…(truncated)" : display

        return (
          <section className="card p-3 text-sm space-y-2" role="region" aria-label="Mozaik answer">
            <div className="flex justify-end gap-2">
              {TOO_LARGE && (
                <button className="text-xs border px-2 py-1 rounded" onClick={()=>setExpanded(v=>!v)}>
                  {expanded ? 'Collapse' : 'Expand'}
                </button>
              )}
              <button className="text-xs border px-2 py-1 rounded" onClick={()=>copyText(display)}>
                Copy
              </button>
            </div>

            {/* Markdown with a fallback to plain text */}
            <div className="prose prose-sm max-w-none">
              {(() => {
                try {
                  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{shown}</ReactMarkdown>
                } catch {
                  return (
                    <>
                      <div className="text-amber-700 mb-1">Rendering warning — showing plain text.</div>
                      <pre className="whitespace-pre-wrap">{shown}</pre>
                    </>
                  )
                }
              })()}
            </div>
          </section>
        );
      })()}
    </div>
  )
}