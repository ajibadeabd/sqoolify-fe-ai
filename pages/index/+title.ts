import type { PageContext } from 'vike/types'
import type { Data } from '../+data'

export default function title(pageContext: PageContext & { data: Data }) {
  const { school, homePage } = pageContext.data || {}
  if (school && homePage) {
    return homePage.description
      ? `${homePage.title} | ${school.name} — ${homePage.description}`
      : `${homePage.title} | ${school.name}`
  }
  if (school) {
    return `Welcome | ${school.name}`
  }
  return 'Sqoolify - Complete School Management Platform'
}
