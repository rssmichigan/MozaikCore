import type { Metadata } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mozaikai.com'
const TITLE = 'Mozaik — plan, research, and execute'
const DESCRIPTION = 'Mozaik helps you plan, research, and execute — with a small memory and clean workflows.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: '%s · Mozaik',
  },
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: 'Mozaik',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      { url: '/icon-512.png', width: 512, height: 512, alt: 'Mozaik' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/icon-512.png'],
  },
  icons: {
    icon: [
      { url: '/icon-192.png', type: 'image/png' },
      { url: '/favicon.ico' }, // optional if present
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
