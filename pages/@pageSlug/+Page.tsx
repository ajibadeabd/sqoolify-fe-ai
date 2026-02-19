import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { useSchool } from '../../lib/school-context'
import type { PublicSchool, SitePage } from '../../lib/types'
import type { Data } from './+data'
import PublicSiteLayout from '../../components/public-site/PublicSiteLayout'
import SectionRenderer from '../../components/public-site/SectionRenderer'
import { getTemplatePage, TEMPLATE_SLUGS } from '../../components/public-site/templates'

const FALLBACK_NAV_PAGES = [
  { _id: 'about', title: 'About Us', slug: 'about', isHomePage: false },
  { _id: 'admissions', title: 'Admissions', slug: 'admissions', isHomePage: false },
  { _id: 'faq', title: 'FAQ', slug: 'faq', isHomePage: false },
  { _id: 'contact', title: 'Contact', slug: 'contact', isHomePage: false },
] as unknown as SitePage[]

export default function DynamicSitePage() {
  const { school } = useSchool()
  const { sitePage, navPages } = useData<Data>() || {}
  const pageContext = usePageContext()
  const pageSlug = (pageContext.routeParams as any)?.pageSlug || ''

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Page not found</p>
      </div>
    )
  }

  const effectiveNavPages = navPages?.length ? navPages : FALLBACK_NAV_PAGES

  // Template pages — render with DB sections (falls back to defaults in component)
  const isTemplatePage = TEMPLATE_SLUGS.includes(pageSlug)
  console.log(JSON.stringify({isTemplatePage,sitePage}, null, 2))
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

  // Fallback to existing SitePage system for non-template slugs (custom page creation disabled)
  // if (!sitePage) {
  //   return (
  //     <PublicSiteLayout school={school as PublicSchool} navPages={effectiveNavPages}>
  //       <div className="min-h-[60vh] flex items-center justify-center">
  //         <div className="text-center">
  //           <h1 className="text-4xl font-bold text-gray-900 mb-3">Page Not Found</h1>
  //           <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
  //           <a href="/" className="text-blue-600 hover:underline font-medium">Go back home</a>
  //         </div>
  //       </div>
  //     </PublicSiteLayout>
  //   )
  // }

  // const visibleSections = sitePage.sections.filter((s) => s.isVisible !== false)

  // return (
  //   <PublicSiteLayout school={school as PublicSchool} navPages={effectiveNavPages}>
  //     <div className="min-h-screen">
  //       {(sitePage.title || sitePage.description) && visibleSections.length > 0 && visibleSections[0].type !== 'hero' && (
  //         <div className="bg-gray-50 py-12 border-b border-gray-200">
  //           <div className="max-w-5xl mx-auto px-4 text-center">
  //             <h1 className="text-3xl font-bold text-gray-900">{sitePage.title}</h1>
  //             {sitePage.description && (
  //               <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{sitePage.description}</p>
  //             )}
  //           </div>
  //         </div>
  //       )}

  //       {visibleSections.length > 0 ? (
  //         visibleSections.map((section, i) => (
  //           <SectionRenderer key={i} section={section} school={school as PublicSchool} />
  //         ))
  //       ) : (
  //         <div className="py-24 text-center">
  //           <h1 className="text-3xl font-bold text-gray-900">{sitePage.title}</h1>
  //           {sitePage.description && (
  //             <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">{sitePage.description}</p>
  //           )}
  //           <p className="mt-6 text-sm text-gray-400">This page is being built. Check back soon.</p>
  //         </div>
  //       )}
  //     </div>
  //   </PublicSiteLayout>
  // )

  // Non-template slug — show 404
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
