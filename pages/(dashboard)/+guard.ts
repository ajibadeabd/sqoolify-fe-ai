import { redirect } from 'vike/abort'
import type { GuardAsync } from 'vike/types'

const guard: GuardAsync = async (pageContext): Promise<void> => {
  // Client-side: check localStorage for token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sqoolify_token')
    if (!token) {
      throw redirect('/login')
    }
  }
}

export { guard }
