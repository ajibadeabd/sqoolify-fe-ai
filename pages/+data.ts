import type { PageContextServer } from 'vike/types'
import type { PublicSchool } from '../lib/types'
import { extractSlugFromHost, isSchoolHost } from '../lib/host-utils'

export type Data = {
  school: PublicSchool | null
  slug: string | null
}

export async function data(pageContext: PageContextServer): Promise<Data> {
  const headers = (pageContext as any).headers as Record<string, string> | undefined
  if (!headers?.host) {
    return { school: null, slug: null }
  }

  const hostname = headers.host.split(':')[0]
  if (!isSchoolHost(hostname)) {
    return { school: null, slug: null }
  }

  const slug = extractSlugFromHost(hostname)
  if (!slug) return { school: null, slug: null }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4120/api/v1'

  try {
    const res = await fetch(`${API_URL}/schools/public/by-slug/${slug}`)
    const json = await res.json()
    const school = json.data || null
    return { school, slug }
  } catch (e) {
    console.error('[+data.ts] Failed to fetch school info:', e)
  }

  return { school: null, slug }
}
