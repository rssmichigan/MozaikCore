'use client'
import Link from "next/link"

export default function Nav(){
  return (
    <nav className="flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-semibold">Mozaik</span>
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/agents" className="underline">Try Mozaik</Link>
        <Link href="/signup" className="border px-3 py-1.5 rounded">Sign up</Link>
        <Link href="/login" className="px-3 py-1.5 rounded">Log in</Link>
      </div>
    </nav>
  )
}
