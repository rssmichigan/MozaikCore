'use client'
import RunTask from "@/components/agents/RunTask"
import History from "@/components/agents/History"
import { useSession } from "next-auth/react"

export default function HomeClient() {
  const { status } = useSession()
  return (
    <section id="try" className="py-14 space-y-6">
      <h2 className="text-2xl font-semibold">Try Mozaik now</h2>
      <RunTask />
      {status === 'authenticated' ? <History /> : null}
    </section>
  )
}
