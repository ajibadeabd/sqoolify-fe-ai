import type { PageContextServer } from 'vike/types'
import type { PublicSchool, SitePage } from '../lib/types'

export type Data = {
  school: PublicSchool | null
  slug: string | null
  homePage: SitePage | null
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
    return { school: null, slug: null, homePage: null }
  }

  const hostname = headers.host.split(':')[0]
  const slug = extractSlugFromHost(hostname)
  if (!slug) {
    return { school: null, slug: null, homePage: null }
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4120/api/v1'

  try {
    const res = await fetch(`${API_URL}/auth/school-by-slug`, {
      headers: { 'x-forwarded-host': headers.host },
    })
    const json = await res.json()
    if (json.data) {
      const school = json.data as PublicSchool

      // Also fetch home page for SSR
      let homePage: SitePage | null = null
      try {
        const homeRes = await fetch(`${API_URL}/public/site-pages/school/${school._id}/home`)
        const homeJson = await homeRes.json()
        if (homeJson.data) {
          homePage = homeJson.data
        }
      } catch (e) {
        console.error('[+data.ts] Failed to fetch home page:', e)
      }

      return { school, slug, homePage }
    }
  } catch (e) {
    console.error('[+data.ts] Failed to fetch school for slug:', slug, e)
  }

  return { school: null, slug, homePage: null }
}
