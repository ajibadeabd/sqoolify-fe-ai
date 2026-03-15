import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import type { CanvasData } from '../../lib/types'

interface CanvasPageRendererProps {
  canvasData: CanvasData
}

export default function CanvasPageRenderer({ canvasData }: CanvasPageRendererProps) {
  const sanitizedHtml = useMemo(() => {
    if (!canvasData.html) return ''
    if (typeof window === 'undefined') return canvasData.html
    return DOMPurify.sanitize(canvasData.html, {
      ADD_TAGS: ['style', 'iframe'],
      ADD_ATTR: ['target', 'allowfullscreen', 'loading', 'frameborder', 'allow'],
    })
  }, [canvasData.html])

  const sanitizedCss = useMemo(() => {
    if (!canvasData.css) return ''
    // Basic CSS sanitization - remove any script-like content
    return canvasData.css
      .replace(/expression\s*\(/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/@import\s+url/gi, '')
  }, [canvasData.css])

  return (
    <div className="canvas-page-content">
      {sanitizedCss && (
        <style dangerouslySetInnerHTML={{ __html: sanitizedCss }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  )
}
