'use client'
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"

export default function Nav(){
  const { data: s, status } = useSession()
  const authed = status === 'authenticated'
  return (
    <nav className="flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-semibold">Mozaik</span>
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/agents" className="underline">Try Mozaik</Link>
        {authed ? (
          <>
            <span className="opacity-70 hidden sm:inline">{s?.user?.email ?? 'Signed in'}</span>
            <button onClick={()=>signOut()} className="border px-3 py-1.5 rounded">Sign out</button>
          </>
        ) : (
          <>
            <Link href="/signup" className="border px-3 py-1.5 rounded">Sign up</Link>
            <button onClick={()=>signIn()} className="px-3 py-1.5 rounded">Log in</button>
          </>
        )}
      </div>
    </nav>
  )
}
