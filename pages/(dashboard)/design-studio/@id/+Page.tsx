import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { useAuth } from '../../../../lib/auth-context'
import { sitePageService } from '../../../../lib/api-services'
import type { SitePage, CanvasData } from '../../../../lib/types'
import DesignStudioEditor from '../../../../components/design-studio/DesignStudioEditor'

export default function DesignStudioPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { user } = useAuth()
  const [page, setPage] = useState<SitePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const lastSaveRef = useRef<string>('')
  const [sidebarWidth, setSidebarWidth] = useState(0)

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
    if (!user?.school || !id) {
      navigate('/site-builder')
      return
    }

    sitePageService.getById(id)
      .then((res) => {
        setPage(res.data)
        // If this page hasn't been set to canvas mode yet, set it
        if (res.data && res.data.editorMode !== 'canvas') {
          sitePageService.update(id, { editorMode: 'canvas' } as any).catch(() => {})
        }
      })
      .catch(() => {
        toast.error('Failed to load page')
        navigate('/site-builder')
      })
      .finally(() => setLoading(false))
  }, [user?.school, id])

  const handleSave = useCallback(async (data: CanvasData) => {
    if (!id || saving) return

    // Deduplicate rapid saves
    const dataHash = JSON.stringify({ c: data.components?.length, h: data.html?.length, css: data.css?.length })
    if (dataHash === lastSaveRef.current) return
    lastSaveRef.current = dataHash

    setSaving(true)
    try {
      await sitePageService.update(id, {
        editorMode: 'canvas',
        canvasData: data,
      } as any)
      toast.success('Saved', { duration: 1500 })
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [id, saving])

  const handlePreview = useCallback(() => {
    if (!page) return
    window.open(`/${page.slug}`, '_blank')
  }, [page, user])

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 bg-[#2b2b2b] z-999 flex items-center justify-center" style={{ left: sidebarWidth }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400">Loading Design Studio...</p>
        </div>
      </div>
    )
  }

  if (!page) return null

  return (
    <div className="fixed inset-y-0 right-0 z-999 flex flex-col bg-[#2b2b2b]" style={{ left: sidebarWidth }}>
      {/* Header */}
      <div className="h-12 bg-[#1e1e1e] border-b border-[#3a3a3a] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/site-builder')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="w-px h-5 bg-[#3a3a3a]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">{page.title}</span>
            <span className="text-gray-500 text-xs font-mono">/{page.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <div className="w-3 h-3 border border-gray-500 border-t-blue-400 rounded-full animate-spin" />
              Saving...
            </span>
          )}
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${page.isPublished ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
            {page.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <DesignStudioEditor
          initialData={page.canvasData}
          onSave={handleSave}
          onPreview={handlePreview}
        />
      </div>
    </div>
  )
}
