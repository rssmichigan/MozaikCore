'use client'
import RunTask from '@/components/agents/RunTask'
import History from '@/components/agents/History'
import { useSession } from 'next-auth/react'

export default function AgentsPage() {
  const { status } = useSession()
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Agents</h1>
      <RunTask />
      {status === 'authenticated' ? <History /> : null}
    </main>
  )
}
