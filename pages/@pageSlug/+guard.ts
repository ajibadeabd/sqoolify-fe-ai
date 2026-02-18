import { redirect } from 'vike/abort'
import type { GuardAsync } from 'vike/types'
import { isSchoolHost } from '../../lib/host-utils'

const guard: GuardAsync = async (pageContext): Promise<void> => {
  const headers = (pageContext as any).headers as Record<string, string> | null
  if (headers) {
    const host = headers['host'] ?? ''
    const hostname = host.split(':')[0]
    if (!isSchoolHost(hostname)) throw redirect('/')
    return
  }

  if (typeof window !== 'undefined') {
    if (!isSchoolHost(window.location.hostname)) throw redirect('/')
  }
}

export { guard }
