import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { useSchool } from '../../lib/school-context'
import { publicSitePageService } from '../../lib/api-services'
import type { SitePage, PublicSchool } from '../../lib/types'
import PublicSiteLayout from '../../components/public-site/PublicSiteLayout'
import SectionRenderer from '../../components/public-site/SectionRenderer'

export default function DynamicSitePage() {
  const pageContext = usePageContext()
  const pageSlug = (pageContext.routeParams as any)?.pageSlug
  const { school } = useSchool()
  const [page, setPage] = useState<SitePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (page && school) {
      document.title = page.description
        ? `${page.title} | ${school.name} — ${page.description}`
        : `${page.title} | ${school.name}`
    }
  }, [page, school])

  useEffect(() => {
    if (!school || !pageSlug) {
      setLoading(false)
      setError(true)
      return
    }

    publicSitePageService.getPageBySlug(school._id, pageSlug)
      .then((res) => {
        setPage(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [school?._id, pageSlug])

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Page not found</p>
      </div>
    )
  }

  if (loading) {
    return (
      <PublicSiteLayout school={school as PublicSchool}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </PublicSiteLayout>
    )
  }

  if (error || !page) {
    return (
      <PublicSiteLayout school={school as PublicSchool}>
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

  const visibleSections = page.sections.filter((s) => s.isVisible !== false)

  return (
    <PublicSiteLayout school={school as PublicSchool}>
      <div className="min-h-screen">
        {/* Page header with title and description */}
        {(page.title || page.description) && visibleSections.length > 0 && visibleSections[0].type !== 'hero' && (
          <div className="bg-gray-50 py-12 border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
              {page.description && (
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{page.description}</p>
              )}
            </div>
          </div>
        )}

        {visibleSections.length > 0 ? (
          visibleSections.map((section, i) => (
            <SectionRenderer key={i} section={section} school={school as PublicSchool} />
          ))
        ) : (
          <div className="py-24 text-center">
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            {page.description && (
              <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">{page.description}</p>
            )}
            <p className="mt-6 text-sm text-gray-400">This page is being built. Check back soon.</p>
          </div>
        )}
      </div>
    </PublicSiteLayout>
  )
}
