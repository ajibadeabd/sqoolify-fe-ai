import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { sitePageService, schoolService } from '../../../../lib/api-services'
import type { SitePage, PageSection, SectionType, School } from '../../../../lib/types'
import { useAuth } from '../../../../lib/auth-context'
import Button from '../../../../components/ui/Button'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import HeroEditor from '../../../../components/site-builder/sections/HeroEditor'
import TextEditor from '../../../../components/site-builder/sections/TextEditor'
import FeaturesEditor from '../../../../components/site-builder/sections/FeaturesEditor'
import GalleryEditor from '../../../../components/site-builder/sections/GalleryEditor'
import ContactEditor from '../../../../components/site-builder/sections/ContactEditor'
import CTAEditor from '../../../../components/site-builder/sections/CTAEditor'
import TestimonialsEditor from '../../../../components/site-builder/sections/TestimonialsEditor'
import StatsEditor from '../../../../components/site-builder/sections/StatsEditor'
import TeamEditor from '../../../../components/site-builder/sections/TeamEditor'
import FAQEditor from '../../../../components/site-builder/sections/FAQEditor'
import CanvasEditor from '../../../../components/public-site/templates/canvas/CanvasEditor'

const SECTION_META: Record<SectionType, { label: string; icon: string; color: string; description: string }> = {
  hero: { label: 'Hero Banner', icon: '🖼', color: 'bg-purple-50 text-purple-600 border-purple-200', description: 'Full-width banner with title, subtitle and CTA' },
  text: { label: 'Text Block', icon: '📝', color: 'bg-blue-50 text-blue-600 border-blue-200', description: 'Rich text content with title and alignment' },
  features: { label: 'Features Grid', icon: '✨', color: 'bg-amber-50 text-amber-600 border-amber-200', description: 'Grid of feature cards with icons' },
  gallery: { label: 'Image Gallery', icon: '📸', color: 'bg-green-50 text-green-600 border-green-200', description: 'Photo gallery with captions' },
  contact: { label: 'Contact Info', icon: '📞', color: 'bg-rose-50 text-rose-600 border-rose-200', description: 'Address, phone and email details' },
  cta: { label: 'Call to Action', icon: '🚀', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', description: 'Colored banner with action buttons' },
  testimonials: { label: 'Testimonials', icon: '💬', color: 'bg-pink-50 text-pink-600 border-pink-200', description: 'Quotes from parents, students or alumni' },
  stats: { label: 'Stats / Numbers', icon: '📊', color: 'bg-teal-50 text-teal-600 border-teal-200', description: 'Key numbers and achievements' },
  team: { label: 'Team / Staff', icon: '👥', color: 'bg-cyan-50 text-cyan-600 border-cyan-200', description: 'Meet the team with photos and bios' },
  faq: { label: 'FAQ', icon: '❓', color: 'bg-orange-50 text-orange-600 border-orange-200', description: 'Frequently asked questions accordion' },
}

const DEFAULT_CONTENT: Record<SectionType, any> = {
  hero: { badge: '', headline: '', headlineSub: '', description: '', stats: [], buttons: [] },
  text: { label: '', title: '', para1: '', para2: '', stats: [], link: { text: '', href: '' }, floatingCard: { val: '', label: '' } },
  features: { label: '', title: '', subtitle: '', features: [] },
  gallery: { label: '', title: '', subtitle: '', images: { main: { src: '', alt: '', label: '', tag: '' }, items: [] }, statCard: { val: '', label: '' } },
  contact: { contactInfo: {} },
  cta: { badge: '', headline: '', description: '', buttons: [] },
  testimonials: { label: '', title: '', testimonials: [] },
  stats: { stats: [] },
  team: { members: [] },
  faq: { title: '', faqs: [], categories: [], allFilterLabel: '', browseAllHeading: '', countSuffix: '', emptyTitle: '', emptyDescription: '', emptyButton: '' },
}

export default function SitePageEditorPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const isNew = id === 'new'
  const { user } = useAuth()

  const [editMode, setEditMode] = useState<'simple' | 'canvas'>('simple')
  const [school, setSchool] = useState<School | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isHomePage, setIsHomePage] = useState(false)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchPage = useCallback(async () => {
    try {
      const [pageRes, schoolRes] = await Promise.all([
        sitePageService.getById(id),
        user?.school ? schoolService.getById(user.school) : Promise.resolve({ data: null }),
      ])
      const page = pageRes.data
      setTitle(page.title)
      setSlug(page.slug)
      setDescription(page.description || '')
      setIsPublished(page.isPublished)
      setIsHomePage(page.isHomePage)
      setSections(page.sections || [])
      setSchool(schoolRes.data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load page')
      navigate('/site-builder')
    } finally {
      setLoading(false)
    }
  }, [id, user?.school])

  useEffect(() => {
    if (!isNew) fetchPage()
  }, [isNew, fetchPage])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAddSection(false)
      }
    }
    if (showAddSection) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAddSection])

  const autoSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (isNew) {
      setSlug(autoSlug(value))
    }
  }

  const addSection = (type: SectionType) => {
    setSections([...sections, { type, content: { ...DEFAULT_CONTENT[type] }, isVisible: true }])
    setShowAddSection(false)
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
    setCollapsedSections((prev) => {
      const next = new Set<number>()
      prev.forEach((i) => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })
      return next
    })
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= sections.length) return
    const updated = [...sections]
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    setSections(updated)
    // Swap collapsed state
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      const hadIndex = prev.has(index)
      const hadTarget = prev.has(target)
      hadIndex ? next.add(target) : next.delete(target)
      hadTarget ? next.add(index) : next.delete(index)
      return next
    })
  }

  const updateSectionContent = (index: number, content: any) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], content }
    setSections(updated)
  }

  const toggleSectionVisibility = (index: number) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], isVisible: !updated[index].isVisible }
    setSections(updated)
  }

  const toggleCollapse = (index: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  const pageObj = useMemo<SitePage>(() => ({
    _id: id,
    title,
    slug,
    sections,
    isPublished,
    isHomePage,
  } as SitePage), [id, title, slug, sections, isPublished, isHomePage])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Page title is required')
      return
    }
    if (!slug.trim()) {
      toast.error('Page slug is required')
      return
    }

    setSaving(true)
    try {
      const data: Partial<SitePage> = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || undefined,
        sections,
        isPublished,
        isHomePage,
      }

      if (isNew) {
        // Page creation disabled
        toast.error('Page creation is disabled')
        return
      } else {
        await sitePageService.update(id, data)
        toast.success('Page saved')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const renderSectionEditor = (section: PageSection, index: number) => {
    const base = {
      content: section.content as any,
      onChange: (content: any) => updateSectionContent(index, content),
    }

    switch (section.type) {
      case 'hero': return <HeroEditor {...base} pageSlug={slug} />
      case 'text': return <TextEditor {...base} pageSlug={slug} />
      case 'features': return <FeaturesEditor {...base} pageSlug={slug} />
      case 'gallery': return <GalleryEditor {...base} />
      case 'contact': return <ContactEditor {...base} pageSlug={slug} />
      case 'cta': return <CTAEditor {...base} />
      case 'testimonials': return <TestimonialsEditor {...base} />
      case 'stats': return <StatsEditor {...base} />
      case 'team': return <TeamEditor {...base} />
      case 'faq': return <FAQEditor {...base} />
      default: return <p className="text-sm text-gray-500">Unknown section type</p>
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
    <>
    {editMode === 'canvas' && school && (
      <CanvasEditor
        school={school}
        page={pageObj}
        onClose={() => setEditMode('simple')}
        onSave={() => { fetchPage(); setEditMode('simple'); }}
      />
    )}
    <div className="max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Site Builder', href: '/site-builder' },
          { label: isNew ? 'New Page' : title || 'Edit Page' },
        ]}
      />

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 py-3 mb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{isNew ? 'Create Page' : 'Edit Page'}</h1>
            {!isNew && (
              <div className="flex items-center gap-2">
                {isPublished ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Published</span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Draft</span>
                )}
                {isHomePage && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Home</span>
                )}
              </div>
            )}
          </div>
          {!isNew && (
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
              <button
                onClick={() => setEditMode('simple')}
                className={`px-3.5 py-1.5 text-xs font-semibold transition ${editMode === 'simple' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Simple
              </button>
              <button
                onClick={() => setEditMode('canvas')}
                className={`px-3.5 py-1.5 text-xs font-semibold transition ${editMode === 'canvas' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Canvas
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {!isNew && isPublished && slug && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/${slug}`, '_blank')}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Preview
                </span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/site-builder')}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              {isNew ? 'Create Page' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Page Settings Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Page Settings</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="About Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Slug</label>
              <div className="flex items-center">
                <span className="px-3.5 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-400 font-mono">/</span>
                <input
                  type="text"
                  value={slug}
                  disabled
                  className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-r-lg text-sm font-mono bg-gray-50 text-gray-500 cursor-not-allowed transition"
                  placeholder="about-us"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="A brief description for SEO and page previews"
            />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
            <label className="relative flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">Published</span>
            </label>
            <label className="relative flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isHomePage}
                onChange={(e) => setIsHomePage(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-9 h-5 bg-gray-200 peer-checked:bg-purple-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">Set as Home Page</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sections Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Sections</h2>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{sections.length}</span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Section
          </button>
          {showAddSection && (
            <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-30 py-2 overflow-y-auto max-h-[60vh]">
              <p className="px-4 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-white">Choose Section Type</p>
              {(Object.keys(SECTION_META) as SectionType[]).map((type) => {
                const meta = SECTION_META[type]
                return (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 group"
                  >
                    <span className="text-xl mt-0.5">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">{meta.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">No sections yet</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Add sections to build your page. Each section is a content block that visitors will see.</p>
            <button
              onClick={() => setShowAddSection(true)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Your First Section
            </button>
          </div>
        ) : (
          sections.map((section, index) => {
            const meta = SECTION_META[section.type]
            const isCollapsed = collapsedSections.has(index)
            return (
              <div key={index} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition ${!section.isVisible ? 'border-gray-200 opacity-60' : 'border-gray-200'}`}>
                {/* Section header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50/50 transition ${isCollapsed ? '' : 'border-b border-gray-100'}`}
                  onClick={() => toggleCollapse(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
                        {!section.isVisible && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded">HIDDEN</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleSectionVisibility(index)}
                      className={`p-1.5 rounded-md transition ${section.isVisible ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'}`}
                      title={section.isVisible ? 'Hide section' : 'Show section'}
                    >
                      {section.isVisible ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <button
                      onClick={() => removeSection(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                      title="Remove section"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleCollapse(index)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition ml-0.5"
                      title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                      <svg className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Section content editor */}
                {!isCollapsed && (
                  <div className="p-5">
                    {renderSectionEditor(section, index)}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Bottom save bar */}
      {sections.length > 0 && (
        <div className="sticky bottom-0 z-20 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 py-3 mt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{sections.length} section{sections.length !== 1 ? 's' : ''} {isPublished ? '- will be published' : '- saved as draft'}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/site-builder')}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} loading={saving}>
                {isNew ? 'Create Page' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
