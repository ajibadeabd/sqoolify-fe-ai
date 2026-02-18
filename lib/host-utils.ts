/**
 * Extract the school slug from a hostname.
 * Only matches *.sqoolify.com and *.localhost subdomains.
 */
export function extractSlugFromHost(hostname: string): string | null {
  const parts = hostname.split('.')
  // Dev: slug.localhost
  if (parts.length === 2 && parts[1] === 'localhost') return parts[0]
  // Production: slug.sqoolify.com (must be sqoolify.com)
  if (parts.length >= 3 && parts.slice(-2).join('.') === 'sqoolify.com') {
    const slug = parts[0]
    if (slug !== 'www' && slug !== 'api') return slug
  }
  return null
}

/**
 * Check if a hostname belongs to a school site.
 * Returns true for *.sqoolify.com subdomains, *.localhost subdomains,
 * and any custom domain (e.g. leampsacademy.msgtrace.com).
 */
export function isSchoolHost(hostname: string): boolean {
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return false
  const mainDomains = ['sqoolify.com', 'www.sqoolify.com']
  if (mainDomains.includes(hostname)) return false
  const parts = hostname.split('.')
  if (parts.length === 2 && parts[1] === 'localhost') return true
  if (parts.length >= 2 && hostname.includes('.')) return true
  return false
}
