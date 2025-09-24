import './globals.css'
import type { ReactNode } from 'react'
import Providers from './Providers'

export const metadata = {
  title: 'Mozaik — Private Generative AI',
  description: 'Plan, research and execute with memory-aware agents.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
