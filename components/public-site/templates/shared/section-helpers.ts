import type { SitePage } from '../../../../lib/types'

/**
 * Extract section content by type from a SitePage's sections array.
 * Returns the content object of the first visible section matching the given type.
 */
export function getSection(sitePage: SitePage | undefined, type: string): Record<string, any> | undefined {
  if (!sitePage?.sections) return undefined
  const section = sitePage.sections.find(s => s.type === type && s.isVisible !== false)
  return section?.content as Record<string, any> | undefined
}

/**
 * Normalize FAQ items from DB format (question/answer/category) to template format (q/a/cat).
 * Handles both DB and content.ts key formats.
 */
export function normalizeFaqs(items: any[] | undefined): { q: string; a: string; cat: string }[] | undefined {
  if (!items || items.length === 0) return undefined
  return items.map(f => ({
    q: f.q || f.question || '',
    a: f.a || f.answer || '',
    cat: f.cat || f.category || '',
  }))
}
