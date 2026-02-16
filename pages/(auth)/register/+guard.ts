import { redirect } from 'vike/abort'
import type { GuardAsync } from 'vike/types'

function extractSlugFromHost(hostname: string): string | null {
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null
  }
  const parts = hostname.split('.')
  if (parts.length === 2 && parts[1] === 'localhost') return parts[0]
  if (parts.length >= 3) {
    const slug = parts[0]
    if (slug !== 'www' && slug !== 'api') return slug
  }
  return null
}

const guard: GuardAsync = async (pageContext): Promise<void> => {
  // Server-side: check headers
  const headers = (pageContext as any).headers as Record<string, string> | null
  if (headers) {
    const host = headers['host'] ?? ''
    const hostname = host.split(':')[0]
    const slug = extractSlugFromHost(hostname)
    console.log('[register guard] SSR host:', host, 'slug:', slug)
    if (slug) {
      throw redirect('/login')
    }
    return
  }

  // Client-side: check window.location
  if (typeof window !== 'undefined') {
    const slug = extractSlugFromHost(window.location.hostname)
    console.log('[register guard] client hostname:', window.location.hostname, 'slug:', slug)
    if (slug) {
      throw redirect('/login')
    }
  }
}

export { guard }
