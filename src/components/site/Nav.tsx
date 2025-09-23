'use client'
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"

export default function Nav(){
  const { data: session, status } = useSession()
  const user = session?.user
  return (
    <nav className="flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-semibold">Mozaik</span>
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/agents" className="underline">Try Mozaik</Link>
        {user ? (
          <>
            <span className="opacity-70 hidden md:inline">Signed in as {user.email}</span>
            <button className="border px-3 py-1.5 rounded" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/signup" className="border px-3 py-1.5 rounded">Sign up</Link>
            <button className="px-3 py-1.5 rounded" onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}>
              {status === "loading" ? "…" : "Sign in"}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
