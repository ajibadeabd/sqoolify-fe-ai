import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { useSchool } from '../../lib/school-context'
import type { PublicSchool, SitePage } from '../../lib/types'
import type { Data } from './+data'
import PublicSiteLayout from '../../components/public-site/PublicSiteLayout'
import { getTemplatePage, TEMPLATE_SLUGS } from '../../components/public-site/templates'

const FALLBACK_NAV_PAGES = [
  { _id: 'about', title: 'About Us', slug: 'about', isHomePage: false },
  { _id: 'admissions', title: 'Admissions', slug: 'admissions', isHomePage: false },
  { _id: 'faq', title: 'FAQ', slug: 'faq', isHomePage: false },
  { _id: 'news', title: 'News & Events', slug: 'news', isHomePage: false },
  { _id: 'contact', title: 'Contact', slug: 'contact', isHomePage: false },
] as unknown as SitePage[]

export default function DynamicSitePage() {
  const { school } = useSchool()
  const { sitePage, navPages, siteDisabled } = useData<Data>() || {}
  const pageContext = usePageContext()
  const pageSlug = (pageContext.routeParams as any)?.pageSlug || ''

  if (pageSlug === 'home' && typeof window !== 'undefined') {
    window.location.replace('/')
    return null
  }

  if (!school || siteDisabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Page not found</p>
      </div>
    )
  }

  const effectiveNavPages = navPages?.length ? navPages : FALLBACK_NAV_PAGES

  const isTemplatePage = TEMPLATE_SLUGS.includes(pageSlug)
  if (isTemplatePage) {
    if (!sitePage) {
      return (
        <PublicSiteLayout school={school as PublicSchool} navPages={effectiveNavPages}>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
              <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="text-blue-600 hover:underline font-medium">Go back home</a>
            </div>
          </div>
        </PublicSiteLayout>
      )
    }
    const TemplateComponent = getTemplatePage(school as PublicSchool, pageSlug)
    return (
      <PublicSiteLayout school={school as PublicSchool} navPages={effectiveNavPages}>
        <TemplateComponent school={school as PublicSchool} sitePage={sitePage} />
      </PublicSiteLayout>
    )
  }

  return (
    <PublicSiteLayout school={school as PublicSchool} navPages={effectiveNavPages}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
          <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
          <a href="/" className="text-blue-600 hover:underline font-medium">Go back home</a>
        </div>
      </div>
    </PublicSiteLayout>
  )
}
