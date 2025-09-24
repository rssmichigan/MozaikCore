import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export default async function Page(){
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Signed in as {session.user.email}</p>
    </main>
  )
}
