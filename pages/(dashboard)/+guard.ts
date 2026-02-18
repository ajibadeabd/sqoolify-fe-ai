import { redirect } from 'vike/abort'
import type { GuardAsync } from 'vike/types'
import { isSchoolHost } from '../../lib/host-utils'

const guard: GuardAsync = async (pageContext): Promise<void> => {
  // Server-side: block root domain
  const headers = (pageContext as any).headers as Record<string, string> | null
  if (headers) {
    const host = headers['host'] ?? ''
    const hostname = host.split(':')[0]
    if (!isSchoolHost(hostname)) {
      throw redirect('/')
    }
    return
  }

  // Client-side: block root domain + require token
  if (typeof window !== 'undefined') {
    if (!isSchoolHost(window.location.hostname)) {
      throw redirect('/')
    }
    const token = localStorage.getItem('sqoolify_token')
    if (!token) {
      throw redirect('/login')
    }
  }
}

export { guard }
