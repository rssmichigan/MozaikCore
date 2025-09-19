import "./globals.css"
import type { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Mozaik — Private Generative AI",
  description: "Ask. Plan. Ship. Your private AI workspace with memory and agents.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-6">{children}</div>
      </body>
    </html>
  )
}
