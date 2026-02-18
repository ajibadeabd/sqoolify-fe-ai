import type { PageContextServer } from 'vike/types'
import type { PublicSchool, SitePage } from '../../lib/types'
import { extractSlugFromHost, isSchoolHost } from '../../lib/host-utils'

export type Data = {
  school: PublicSchool | null
  slug: string | null
  homePage: null
  sitePage: SitePage | null
  navPages: SitePage[]
}

export async function data(pageContext: PageContextServer): Promise<Data> {
  const headers = (pageContext as any).headers as Record<string, string> | undefined
  if (!headers?.host) return { school: null, slug: null, homePage: null, sitePage: null, navPages: [] }

  const hostname = headers.host.split(':')[0]
  if (!isSchoolHost(hostname)) return { school: null, slug: null, homePage: null, sitePage: null, navPages: [] }

  const slug = extractSlugFromHost(hostname)
  const pageSlug = (pageContext.routeParams as any)?.pageSlug
  if (!pageSlug) return { school: null, slug, homePage: null, sitePage: null, navPages: [] }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4120/api/v1'

  try {
    const res = await fetch(`${API_URL}/public/site-pages/by-host/${pageSlug}`, {
      headers: { 'x-forwarded-host': headers.host },
    })
    const json = await res.json()
    const { school, sitePage, navPages } = json.data || {}

    return {
      school: school || null,
      slug: slug || school?.slug || null,
      homePage: null,
      sitePage: sitePage || null,
      navPages: navPages || [],
    }
  } catch (e) {
    console.error('[pageSlug/+data.ts] Failed to fetch page:', e)
  }

  return { school: null, slug, homePage: null, sitePage: null, navPages: [] }
}
