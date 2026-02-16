/**
 * Extract the school slug from the current hostname.
 * Handles both production (slug.sqoolify.com) and dev (slug.localhost).
 * Returns null if on root domain or plain localhost.
 */
export function getSchoolSlug(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;

  // Plain localhost or IP — no subdomain
  if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return null;
  }

  const parts = hostname.split('.');

  // Dev: slug.localhost (2 parts)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0];
  }

  // Production: slug.sqoolify.com (3+ parts)
  if (parts.length >= 3) {
    const slug = parts[0];
    if (slug !== 'www' && slug !== 'api') {
      return slug;
    }
  }

  return null;
}

/**
 * Check if we're on the root domain (sqoolify.com or plain localhost).
 */
export function isRootDomain(): boolean {
  return getSchoolSlug() === null;
}

/**
 * Build a full URL for a school subdomain.
 * e.g. buildSchoolUrl("green-field") → "https://green-field.sqoolify.com"
 * In dev: buildSchoolUrl("green-field") → "http://green-field.localhost:3000"
 */
export function buildSchoolUrl(slug: string): string {
  if (typeof window === 'undefined') return '';

  const { protocol, hostname, port } = window.location;

  // Plain localhost or IP → slug.localhost:port
  if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `${protocol}//${slug}.localhost${port ? `:${port}` : ''}`;
  }

  const parts = hostname.split('.');

  // Already on a subdomain of localhost (e.g. other-school.localhost)
  if (parts[parts.length - 1] === 'localhost') {
    return `${protocol}//${slug}.localhost${port ? `:${port}` : ''}`;
  }

  // Production: last 2 parts = base domain (sqoolify.com)
  const baseDomain = parts.slice(-2).join('.');
  return `${protocol}//${slug}.${baseDomain}${port ? `:${port}` : ''}`;
}
