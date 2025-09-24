export const dynamic = 'force-dynamic'

import Link from "next/link"
import Nav from "@/components/site/Nav"
import Footer from "@/components/site/Footer"
import HomeClient from "./HomeClient"

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-4 rounded-lg border bg-white/50">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm opacity-75">{desc}</p>
    </div>
  )
}

export default function Home(){
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_60%)]">
      <div className="container">
        <Nav />

        <section className="py-12 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Private Generative AI for your business
          </h1>
          <p className="max-w-2xl mx-auto opacity-80">
            Plan, research and execute with Mozaik’s memory-aware agents.
            Your data stays private. Your output ships faster.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="#try" className="btn">Try it live</Link>
            <Link href="/signup" className="btn btn-primary">Create account</Link>
          </div>
          <div className="text-xs opacity-60">No credit card required • 1-click sign in</div>
        </section>

        <section className="py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Feature title="Agents that remember" desc="Mozaik stores your private context so answers improve over time." />
          <Feature title="Live export" desc="Export runs as Markdown with one click for docs & sharing." />
          <Feature title="Production guardrails" desc="Built-in rate limiting and DB audit trail for safe, scalable use." />
        </section>

        <HomeClient />
        <Footer />
      </div>
    </main>
  )
}
