import type { PageContext } from 'vike/types'
import type { Data } from './+data'

export default function title(pageContext: PageContext & { data: Data }) {
  const { school, sitePage } = pageContext.data || {}
  if (sitePage && school) {
    return sitePage.description
      ? `${sitePage.title} | ${school.name} — ${sitePage.description}`
      : `${sitePage.title} | ${school.name}`
  }
  if (school) {
    return school.name
  }
  return 'Sqoolify'
}
