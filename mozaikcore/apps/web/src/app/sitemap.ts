import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://mozaikai.com'
  const now = new Date().toISOString()

  const paths = [
    '',           // /
    'ingest',
    'semantic',
    'tools',
    'profile',
    'critic',
  ]

  return paths.map(p => ({
    url: `${base}/${p}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: p === '' ? 1.0 : 0.7,
  }))
}
