'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }){
  return (
    <main className="p-10 text-center space-y-4">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <div className="text-sm opacity-70">{error?.message || 'Unexpected error'}</div>
      <button className="border px-3 py-1.5 rounded" onClick={()=>reset()}>Try again</button>
    </main>
  )
}
