import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth"
import RunTask from "../../components/agents/RunTask"

export default async function Page(){
  const session = await getServerSession(authOptions)
  if(!session?.user) redirect("/login")
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Mozaik Agents</h1>
      <RunTask />
    </main>
  )
}