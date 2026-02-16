import type { PageContextServer } from 'vike/types'

export type Data = {
  school: { _id: string; name: string; slug: string } | null
  slug: string | null
}

function extractSlugFromHost(hostname: string): string | null {
  const parts = hostname.split('.')
  // Dev: slug.localhost
  if (parts.length === 2 && parts[1] === 'localhost') return parts[0]
  // Production: slug.sqoolify.com
  if (parts.length >= 3) {
    const slug = parts[0]
    if (slug !== 'www' && slug !== 'api') return slug
  }
  return null
}

export async function data(pageContext: PageContextServer): Promise<Data> {
  const headers = (pageContext as any).headers as Record<string, string> | undefined
  if (!headers?.host) {
    return { school: null, slug: null }
  }

  const hostname = headers.host.split(':')[0]
  const slug = extractSlugFromHost(hostname)
  if (!slug) {
    return { school: null, slug: null }
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4120/api/v1'

  try {
    const res = await fetch(`${API_URL}/auth/school-by-slug`, {
      headers: { 'x-forwarded-host': headers.host },
    })
    const json = await res.json()
    if (json.data) {
      return { school: json.data, slug }
    }
  } catch (e) {
    console.error('[+data.ts] Failed to fetch school for slug:', slug, e)
  }

  return { school: null, slug }
}
