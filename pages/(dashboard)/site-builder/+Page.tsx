import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { navigate } from 'vike/client/router'
import { sitePageService, siteConfigService, schoolService } from '../../../lib/api-services'
import type { SitePage, SiteConfig, School, PublicSchool } from '../../../lib/types'
import { useAuth } from '../../../lib/auth-context'
import Button from '../../../components/ui/Button'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import { getTemplatePage, getTemplateHome } from '../../../components/public-site/templates'
import PublicSiteLayout from '../../../components/public-site/PublicSiteLayout'

const SECTION_ICONS: Record<string, string> = {
  hero: '🖼', text: '📝', features: '✨', gallery: '📸', contact: '📞', cta: '🚀',
}

export default function SiteBuilderPage() {
  const { user } = useAuth()
  const [pages, setPages] = useState<SitePage[]>([])
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfigModal, setShowConfigModal] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pagesRes, schoolRes] = await Promise.allSettled([
        sitePageService.getAll(),
        user?.school ? schoolService.getById(user.school) : Promise.resolve({ data: null }),
      ])
      if (pagesRes.status === 'fulfilled') setPages(pagesRes.value.data || [])
      if (schoolRes.status === 'fulfilled') {
        console.log('schoolRes', schoolRes.value, 'currentSchool:', user?.school)
        setSchool(schoolRes.value.data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load site builder')
    } finally {
      setLoading(false)
    }
  }, [user?.school])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return
    try {
      await sitePageService.delete(id)
      toast.success('Page deleted')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete page')
    }
  }

  const handleTogglePublish = async (page: SitePage) => {
    try {
      await sitePageService.update(page._id, { isPublished: !page.isPublished } as any)
      toast.success(page.isPublished ? 'Page unpublished' : 'Page published')
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update page')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Site Builder' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your school's public website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {return  setShowConfigModal(true)}}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </span>
          </Button>
          {/* <Button variant="outline" size="sm" onClick={() => navigate('/site-builder/templates')}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Templates
            </span>
          </Button> */}
          {/* <Button size="sm" onClick={() => navigate('/site-builder/new')}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Page
            </span>
          </Button> */}
        </div>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">No pages yet</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Create your first page to start building your school's public website.</p>
          {/* <div className="mt-5">
            <Button size="sm" onClick={() => navigate('/site-builder/new')}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Page
              </span>
            </Button>
          </div> */}
        </div>
      ) : (
        <div className="grid gap-3">
          {pages.map((page) => {
            const isCanvas = school?.siteConfig?.template === 'canvas'
            const blockCount = page.canvasBlocks?.length ?? 0
            return (
            <div
              key={page._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(isCanvas ? `/canvas-editor/${page._id}` : `/site-builder/${page._id}`)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition">{page.title}</h3>
                      {page.isHomePage && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Home</span>
                      )}
                      {page.isPublished ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Published</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 font-mono">/{page.slug}</p>
                    {isCanvas ? (
                      blockCount > 0 && (
                        <p className="text-xs text-gray-400 mt-2">{blockCount} canvas block{blockCount !== 1 ? 's' : ''}</p>
                      )
                    ) : (
                      page.sections.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {page.sections.slice(0, 6).map((s, i) => (
                            <span key={i} className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-xs" title={s.type}>
                              {SECTION_ICONS[s.type] || '?'}
                            </span>
                          ))}
                          {page.sections.length > 6 && (
                            <span className="text-xs text-gray-400 ml-1">+{page.sections.length - 6}</span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleTogglePublish(page)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      {page.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete page"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {showConfigModal && school && (
        <SiteConfigModal
          school={school}
          onClose={() => setShowConfigModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  )
}

const PREVIEW_PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'faq', label: 'FAQ' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'news', label: 'News' },
  { key: 'contact', label: 'Contact' },
] as const

function TemplatePreviewModal({
  templateId,
  templateName,
  school,
  onClose,
}: {
  templateId: string
  templateName: string
  school: School
  onClose: () => void
}) {
  const [activePage, setActivePage] = useState<string>('home')
  const [sidebarWidth, setSidebarWidth] = useState(64)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sidebar = document.querySelector('aside')
    if (!sidebar) return
    setSidebarWidth(sidebar.getBoundingClientRect().width)
    const observer = new ResizeObserver((entries) => {
      setSidebarWidth(entries[0].contentRect.width)
    })
    observer.observe(sidebar)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [activePage])

  const previewSchool = useMemo<PublicSchool>(() => ({
    _id: school._id,
    name: school.name,
    slug: (school as any).slug || '',
    logo: school.schoolSetup?.logo,
    phone: school.schoolSetup?.schoolPhoneNumber,
    email: school.schoolSetup?.schoolEmailAddress,
    address: school.schoolSetup?.schoolAddress,
    siteConfig: { ...school.siteConfig, template: templateId as any },
  }), [school, templateId])

  const PageComponent = activePage === 'home'
    ? getTemplateHome(previewSchool)
    : getTemplatePage(previewSchool, activePage)

  return (
    <div
      className="fixed inset-y-0 right-0 bg-black/70 flex items-center justify-center z-100 p-4 transition-all duration-300"
      style={{ left: sidebarWidth }}
      onClick={onClose}
    >
      <div className="bg-white rounded-xl w-full h-full overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">{templateName} Template</h3>
            <p className="text-xs text-gray-500">Preview with your school's data</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Page tabs */}
        <div className="px-5 flex gap-1 shrink-0 border-b border-gray-100 bg-gray-50/50">
          {PREVIEW_PAGES.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePage(p.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activePage === p.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Scaled preview */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <div style={{ zoom: 0.5 }}>
            <PublicSiteLayout school={previewSchool}>
              <PageComponent school={previewSchool} />
            </PublicSiteLayout>
          </div>
        </div>
      </div>
    </div>
  )
}

function SiteConfigModal({ school, onClose, onSave }: { school: School; onClose: () => void; onSave: () => void }) {
  const [config, setConfig] = useState<SiteConfig>(school.siteConfig || {})
  const [saving, setSaving] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<{ id: string; name: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      await siteConfigService.update(school._id, config)
      toast.success('Site settings saved')
      onSave()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: 'f' },
    { key: 'twitter', label: 'Twitter / X', icon: 'x' },
    { key: 'instagram', label: 'Instagram', icon: 'ig' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'in' },
    { key: 'youtube', label: 'YouTube', icon: 'yt' },
  ] as const

  return (
    <>
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Site Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your public site's appearance and branding</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Template Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Website Template</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'classic' as const, name: 'Classic', desc: 'Dark heroes, elegant cards', gradient: 'from-gray-900 via-gray-800 to-gray-700' },
                { id: 'modern' as const, name: 'Modern', desc: 'Light & airy, soft gradients', gradient: 'from-blue-50 via-white to-purple-50' },
                { id: 'bold' as const, name: 'Bold', desc: 'Full-bleed, high contrast', gradient: 'from-black via-gray-900 to-black' },
                { id: 'editorial' as const, name: 'Editorial', desc: 'Magazine-style, ultra-bold', gradient: 'from-gray-950 via-gray-900 to-black' },
                { id: 'prestige' as const, name: 'Prestige', desc: 'Split-screen luxury layout', gradient: 'from-white via-gray-50 to-gray-200' },
              ]).map((t) => {
                const isActive = (config.template || 'prestige') === t.id
                return (
                  <div
                    key={t.id}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                      isActive
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, template: t.id })}
                      className="w-full text-left"
                    >
                      <div className={`h-16 rounded-lg bg-linear-to-br ${t.gradient} mb-2.5`} />
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate({ id: t.id, name: t.name })}
                      className="mt-2 w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg py-1.5 transition-colors"
                    >
                      Preview
                    </button>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={config.primaryColor || '#3B82F6'}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-12 h-12 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition"
                />
              </div>
              <input
                type="text"
                value={config.primaryColor || '#3B82F6'}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="w-20 h-10 rounded-lg" style={{ backgroundColor: config.primaryColor || '#3B82F6' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={config.secondaryColor || config.primaryColor || '#3B82F6'}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="w-12 h-12 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition"
                />
              </div>
              <input
                type="text"
                value={config.secondaryColor || ''}
                onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto (darker primary)"
              />
              <div className="w-20 h-10 rounded-lg" style={{ backgroundColor: config.secondaryColor || config.primaryColor || '#3B82F6' }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Leave empty to auto-derive from primary color</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
            <input
              type="text"
              value={config.footerText || ''}
              onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`\u00A9 ${new Date().getFullYear()} ${school.name}. All rights reserved.`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Social Links</label>
            <div className="space-y-2.5">
              {socialPlatforms.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-20 text-xs font-medium text-gray-500 text-right shrink-0">{label}</span>
                  <input
                    type="url"
                    value={(config.socialLinks as any)?.[key] || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        socialLinks: { ...config.socialLinks, [key]: e.target.value },
                      })
                    }
                    placeholder={`https://${key}.com/...`}
                    className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>Save Settings</Button>
        </div>
      </div>
    </div>
    {previewTemplate && (
      <TemplatePreviewModal
        templateId={previewTemplate.id}
        templateName={previewTemplate.name}
        school={school}
        onClose={() => setPreviewTemplate(null)}
      />
    )}
    </>
  )
}
