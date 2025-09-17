import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth"                    // relative path
import MemoryPanel from "../../components/memory/MemoryPanel" // relative path

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm opacity-80">Signed in as {session.user.email}</p>
      <MemoryPanel />
    </main>
  )
}