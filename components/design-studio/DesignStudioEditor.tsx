import { useEffect, useRef, useCallback } from 'react'
import grapesjs, { type Editor } from 'grapesjs'
import gjsPresetWebpage from 'grapesjs-preset-webpage'
import gjsBlocksBasic from 'grapesjs-blocks-basic'
import gjsPluginForms from 'grapesjs-plugin-forms'
import gjsStyleBg from 'grapesjs-style-bg'
import 'grapesjs/dist/css/grapes.min.css'
import '../../assets/grapesjs-overrides.css'
import { registerSchoolBlocks } from './school-blocks'
import { configureAssetManager } from './asset-manager'
import type { CanvasData } from '../../lib/types'

interface DesignStudioEditorProps {
  initialData?: CanvasData
  onSave: (data: CanvasData) => void
  onPreview?: () => void
}

export default function DesignStudioEditor({ initialData, onSave, onPreview }: DesignStudioEditorProps) {
  const editorRef = useRef<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const extractData = useCallback((): CanvasData => {
    const editor = editorRef.current
    if (!editor) return { components: [], styles: [], html: '', css: '', assets: [] }

    return {
      components: editor.getComponents().map((c: any) => c.toJSON()),
      styles: editor.getStyle().map((s: any) => (typeof s.toJSON === 'function' ? s.toJSON() : s)),
      html: editor.getHtml(),
      css: editor.getCss() || '',
      assets: editor.AssetManager.getAll().map((a: any) => (typeof a.toJSON === 'function' ? a.toJSON() : a)),
    }
  }, [])

  const handleSave = useCallback(() => {
    const data = extractData()
    onSave(data)
  }, [extractData, onSave])

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return

    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%',
      width: 'auto',
      fromElement: false,
      storageManager: false,
      cssIcons: '',

      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        ],
      },

      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile', width: '375px', widthMedia: '480px' },
        ],
      },

      blockManager: {
        appendTo: '#design-studio-blocks',
      },

      layerManager: {
        appendTo: '#design-studio-layers',
      },

      styleManager: {
        appendTo: '#design-studio-styles',
        sectors: [
          {
            name: 'General',
            open: true,
            properties: [
              'display',
              'float',
              'position',
              'top',
              'right',
              'left',
              'bottom',
            ],
          },
          {
            name: 'Dimension',
            open: false,
            properties: [
              'width',
              'height',
              'max-width',
              'min-height',
              'margin',
              'padding',
            ],
          },
          {
            name: 'Typography',
            open: false,
            properties: [
              'font-family',
              'font-size',
              'font-weight',
              'letter-spacing',
              'color',
              'line-height',
              'text-align',
              'text-decoration',
              'text-shadow',
            ],
          },
          {
            name: 'Decorations',
            open: false,
            properties: [
              'opacity',
              'border-radius',
              'border',
              'box-shadow',
              'background',
              'background-color',
            ],
          },
          {
            name: 'Extra',
            open: false,
            properties: [
              'transition',
              'perspective',
              'transform',
            ],
          },
        ],
      },

      traitManager: {
        appendTo: '#design-studio-traits',
      },

      selectorManager: {
        appendTo: '#design-studio-selectors',
      },

      panels: {
        defaults: [],
      },

      plugins: [gjsPresetWebpage, gjsBlocksBasic, gjsPluginForms, gjsStyleBg],

      pluginsOpts: {
        [gjsPresetWebpage as any]: {
          blocksBasicOpts: false,
          formsOpts: false,
        },
        [gjsBlocksBasic as any]: {
          flexGrid: true,
        },
        [gjsPluginForms as any]: {},
        [gjsStyleBg as any]: {},
      },
    })

    // Register custom school blocks
    registerSchoolBlocks(editor)

    // Add basic building blocks
    const bm = editor.BlockManager

    bm.add('text', {
      label: 'Text',
      category: 'Basic',
      content: '<div style="padding: 10px;"><p>Insert your text here</p></div>',
    })

    bm.add('heading', {
      label: 'Heading',
      category: 'Basic',
      content: '<h2 style="padding: 10px; font-size: 28px; font-weight: 700;">Heading</h2>',
    })

    bm.add('image', {
      label: 'Image',
      category: 'Basic',
      content: { type: 'image' },
      activate: true,
    })

    bm.add('link', {
      label: 'Link',
      category: 'Basic',
      content: '<a href="#" style="color: #2563eb; text-decoration: underline;">Link text</a>',
    })

    bm.add('button', {
      label: 'Button',
      category: 'Basic',
      content: '<a href="#" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Button</a>',
    })

    bm.add('divider', {
      label: 'Divider',
      category: 'Basic',
      content: '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />',
    })

    bm.add('spacer', {
      label: 'Spacer',
      category: 'Basic',
      content: '<div style="height: 40px;"></div>',
    })

    bm.add('video', {
      label: 'Video',
      category: 'Basic',
      content: { type: 'video', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', style: { width: '100%', height: '350px' } },
    })

    bm.add('map', {
      label: 'Map',
      category: 'Basic',
      content: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7!2d3.37!3d6.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjcnMDAuMCJOIDPCsDIyJzEyLjAiRQ!5e0!3m2!1sen!2sng!4v1" style="width: 100%; height: 300px; border: 0;" allowfullscreen loading="lazy"></iframe>',
    })

    bm.add('1-column', {
      label: '1 Column',
      category: 'Layout',
      content: '<div style="padding: 20px;"><div style="min-height: 75px;"></div></div>',
    })

    bm.add('2-columns', {
      label: '2 Columns',
      category: 'Layout',
      content: `
        <div style="display: flex; gap: 20px; padding: 20px;">
          <div style="flex: 1; min-height: 75px;"></div>
          <div style="flex: 1; min-height: 75px;"></div>
        </div>
      `,
    })

    bm.add('3-columns', {
      label: '3 Columns',
      category: 'Layout',
      content: `
        <div style="display: flex; gap: 20px; padding: 20px;">
          <div style="flex: 1; min-height: 75px;"></div>
          <div style="flex: 1; min-height: 75px;"></div>
          <div style="flex: 1; min-height: 75px;"></div>
        </div>
      `,
    })

    bm.add('section', {
      label: 'Section',
      category: 'Layout',
      content: '<section style="padding: 60px 40px; max-width: 1200px; margin: 0 auto;"><div style="min-height: 75px;"></div></section>',
    })

    // Configure asset manager for file uploads
    configureAssetManager(editor)

    // Load initial data
    if (initialData?.components && Array.isArray(initialData.components) && initialData.components.length > 0) {
      editor.setComponents(initialData.components)
      if (initialData.styles) {
        editor.setStyle(initialData.styles)
      }
      if (initialData.assets && Array.isArray(initialData.assets)) {
        editor.AssetManager.add(initialData.assets)
      }
    }

    // Keyboard shortcuts
    editor.on('run:core:undo', () => editor.UndoManager.undo())
    editor.on('run:core:redo', () => editor.UndoManager.redo())

    editorRef.current = editor

    // Auto-save every 30 seconds
    autoSaveTimerRef.current = setInterval(() => {
      const data = extractData()
      onSave(data)
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
      editor.destroy()
      editorRef.current = null
    }
  }, [])

  return (
    <div className="design-studio-wrapper flex h-full">
      {/* Left sidebar - Blocks & Layers */}
      <div className="w-[280px] bg-[#2b2b2b] flex flex-col shrink-0 border-r border-[#3a3a3a]">
        {/* Sidebar tabs */}
        <SidebarTabs />
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {/* Top toolbar */}
        <div className="h-10 bg-[#363636] border-b border-[#444] flex items-center justify-between px-3">
          <div className="flex items-center gap-1">
            <ToolbarButton
              title="Undo (Ctrl+Z)"
              onClick={() => editorRef.current?.UndoManager.undo()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a4 4 0 014 4v2M3 10l4-4M3 10l4 4" /></svg>
            </ToolbarButton>
            <ToolbarButton
              title="Redo (Ctrl+Shift+Z)"
              onClick={() => editorRef.current?.UndoManager.redo()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a4 4 0 00-4 4v2M21 10l-4-4M21 10l-4 4" /></svg>
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1">
            <DeviceButton editor={editorRef} device="Desktop" label="Desktop" />
            <DeviceButton editor={editorRef} device="Tablet" label="Tablet" />
            <DeviceButton editor={editorRef} device="Mobile" label="Mobile" />
          </div>

          <div className="flex items-center gap-1">
            <ToolbarButton title="Toggle borders" onClick={() => {
              const cmd = editorRef.current?.Commands
              if (cmd?.isActive('sw-visibility')) {
                cmd.stop('sw-visibility')
              } else {
                cmd?.run('sw-visibility')
              }
            }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
            </ToolbarButton>
            <ToolbarButton title="Preview" onClick={onPreview}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </ToolbarButton>
            <button
              onClick={handleSave}
              className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition"
            >
              Save
            </button>
          </div>
        </div>

        <div ref={containerRef} className="gjs-editor-cont" style={{ height: 'calc(100% - 40px)' }} />
      </div>

      {/* Right sidebar - Styles & Traits */}
      <div className="w-[280px] bg-[#2b2b2b] flex flex-col shrink-0 border-l border-[#3a3a3a] overflow-y-auto">
        <div className="p-3 border-b border-[#3a3a3a]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selector</h3>
        </div>
        <div id="design-studio-selectors" />

        <div className="p-3 border-b border-[#3a3a3a]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Style</h3>
        </div>
        <div id="design-studio-styles" />

        <div className="p-3 border-b border-[#3a3a3a]">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Traits</h3>
        </div>
        <div id="design-studio-traits" />
      </div>
    </div>
  )
}

function SidebarTabs() {
  return (
    <>
      <div className="p-3 border-b border-[#3a3a3a]">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Blocks</h3>
      </div>
      <div id="design-studio-blocks" className="flex-1 overflow-y-auto" />

      <div className="p-3 border-b border-[#3a3a3a]">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Layers</h3>
      </div>
      <div id="design-studio-layers" className="overflow-y-auto" style={{ maxHeight: '250px' }} />
    </>
  )
}

function ToolbarButton({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#4a4a4a] rounded transition"
    >
      {children}
    </button>
  )
}

function DeviceButton({ editor, device, label }: { editor: React.RefObject<Editor | null>; device: string; label: string }) {
  return (
    <button
      onClick={() => editor.current?.setDevice(device)}
      className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-[#4a4a4a] rounded transition"
    >
      {label}
    </button>
  )
}
