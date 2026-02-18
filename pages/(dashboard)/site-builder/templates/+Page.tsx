import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { navigate } from 'vike/client/router'
import { pageTemplateService } from '../../../../lib/api-services'
import type { PageTemplate, PublicSchool } from '../../../../lib/types'
import { useAuth } from '../../../../lib/auth-context'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import SectionRenderer from '../../../../components/public-site/SectionRenderer'

const SECTION_ICONS: Record<string, string> = {
  hero: '🖼', text: '📝', features: '✨', gallery: '📸', contact: '📞', cta: '🚀',
  testimonials: '💬', stats: '📊', team: '👥', faq: '❓',
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  landing: 'Landing Page',
  academic: 'Academic',
  admissions: 'Admissions',
  community: 'Community',
  events: 'Events',
  informational: 'Informational',
}

export default function TemplateGalleryPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<PageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null)
  const [importing, setImporting] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await pageTemplateService.getAll()
      setTemplates(res.data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  const filtered = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const handleImport = async (template: PageTemplate) => {
    setImporting(template._id)
    try {
      const res = await pageTemplateService.import(template._id)
      toast.success(`"${template.name}" imported successfully`)
      navigate(`/site-builder/${res.data._id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to import template')
    } finally {
      setImporting(null)
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
      <Breadcrumbs items={[
        { label: 'Site Builder', href: '/site-builder' },
        { label: 'Templates' },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose from {templates.length} professionally designed templates to get started fast
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/site-builder')}>
          Back to Pages
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat === 'all' ? 'All Templates' : CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">No templates in this category</h3>
          <p className="mt-1 text-sm text-gray-500">Try selecting a different category</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(template => (
            <TemplateCard
              key={template._id}
              template={template}
              importing={importing === template._id}
              onPreview={() => setPreviewTemplate(template)}
              onImport={() => handleImport(template)}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          importing={importing === previewTemplate._id}
          onClose={() => setPreviewTemplate(null)}
          onImport={() => handleImport(previewTemplate)}
        />
      )}
    </div>
  )
}

function TemplateCard({
  template,
  importing,
  onPreview,
  onImport,
}: {
  template: PageTemplate
  importing: boolean
  onPreview: () => void
  onImport: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      {/* Section minimap preview */}
      <div
        className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100 p-4 cursor-pointer relative overflow-hidden"
        onClick={onPreview}
      >
        <div className="space-y-1.5">
          {template.sections.slice(0, 5).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs">{SECTION_ICONS[s.type] || '?'}</span>
              <div className="flex-1">
                <div
                  className="h-2 rounded-full bg-gray-200"
                  style={{ width: `${60 + Math.random() * 30}%` }}
                />
              </div>
            </div>
          ))}
          {template.sections.length > 5 && (
            <p className="text-[10px] text-gray-400 pl-6">+{template.sections.length - 5} more sections</p>
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700 shadow-sm">
            Preview
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{template.name}</h3>
          <Badge variant="info" size="sm">
            {CATEGORY_LABELS[template.category] || template.category}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{template.description}</p>

        <div className="flex items-center gap-1.5 mb-4">
          {template.sections.slice(0, 8).map((s, i) => (
            <span
              key={i}
              className="w-6 h-6 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[10px]"
              title={s.type}
            >
              {SECTION_ICONS[s.type] || '?'}
            </span>
          ))}
          {template.sections.length > 8 && (
            <span className="text-[10px] text-gray-400">+{template.sections.length - 8}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            Preview
          </button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onImport}
            loading={importing}
          >
            Use Template
          </Button>
        </div>
      </div>
    </div>
  )
}

function TemplatePreviewModal({
  template,
  importing,
  onClose,
  onImport,
}: {
  template: PageTemplate
  importing: boolean
  onClose: () => void
  onImport: () => void
}) {
  const mockSchool: PublicSchool = {
    _id: 'preview',
    name: 'Your School Name',
    slug: 'preview',
    siteConfig: { primaryColor: '#3B82F6' },
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">{template.name}</h2>
          <Badge variant="info" size="sm">
            {CATEGORY_LABELS[template.category] || template.category}
          </Badge>
          <span className="text-xs text-gray-400">{template.sections.length} sections</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={onImport} loading={importing}>
            Use This Template
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="max-w-[1200px] mx-auto bg-white min-h-full shadow-xl">
          {template.sections.map((section, i) => (
            <SectionRenderer
              key={i}
              section={section}
              school={mockSchool}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
