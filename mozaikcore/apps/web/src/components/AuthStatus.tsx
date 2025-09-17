'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type U = { user_id: string, display_name?: string | null }

export default function AuthStatus() {
  const [u, setU] = useState<U | null>(null)
  useEffect(() => {
    fetch('/api/whoami').then(r=>r.json()).then(j => setU(j.user)).catch(()=>{})
  }, [])
  if (!u) return (
    <div className="text-sm">
      <Link href="/login" className="underline">Login</Link>
    </div>
  )
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Hi, {u.display_name || u.user_id}</span>
      <form action="/api/logout" method="POST">
        <button className="underline">Logout</button>
      </form>
    </div>
  )
}
