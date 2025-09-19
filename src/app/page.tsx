import RunTask from "@/components/agents/RunTask"
import History from "@/components/agents/History"

export default async function Home() {
  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Private Generated AI</h1>
        <span className="text-sm opacity-75">Welcome to Mozaik</span>
      </header>

      <section className="space-y-4">
        <RunTask />
        <History onRerun={() => {}} />
      </section>
    </main>
  )
}
