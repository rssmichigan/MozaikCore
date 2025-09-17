"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function AuthButton(){
  const { data: session, status } = useSession()
  if (status === "loading") return <div className="opacity-50">…</div>
  if (session?.user){
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm">Hi, {session.user.name ?? session.user.email}</span>
        <button className="px-3 py-2 rounded bg-gray-200" onClick={()=>signOut({ callbackUrl:"/" })}>
          Sign out
        </button>
      </div>
    )
  }
  return (
    <div className="flex gap-2">
      <Link className="px-3 py-2 rounded bg-black text-white" href="/login">Sign in</Link>
      <Link className="px-3 py-2 rounded border" href="/signup">Sign up</Link>
    </div>
  )
}