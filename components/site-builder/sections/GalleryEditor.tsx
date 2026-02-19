import { useState } from 'react'
import type { GallerySectionContent } from '../../../lib/types'
import { fileService } from '../../../lib/api-services'
import { toast } from 'sonner'

export default function GalleryEditor({
  content,
  onChange,
}: {
  content: GallerySectionContent
  onChange: (content: GallerySectionContent) => void
}) {
  const [uploading, setUploading] = useState<string | null>(null)
  const images = content.images || { main: undefined, items: [] }
  const items = images.items || []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(typeof target === 'number' ? `item-${target}` : target)
    try {
      const res = await fileService.upload(file)
      const url = res.data.url
      if (target === 'main') {
        onChange({
          ...content,
          images: { ...images, main: { ...images.main, src: url, alt: images.main?.alt || '' } as any },
        })
      } else {
        const updated = [...items]
        updated[target] = { ...updated[target], src: url }
        onChange({ ...content, images: { ...images, items: updated } })
      }
      toast.success('Image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(null)
    }
  }

  const updateMain = (field: string, value: string) => {
    onChange({
      ...content,
      images: { ...images, main: { ...images.main, [field]: value } as any },
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, images: { ...images, items: updated } })
  }

  const addItem = () => {
    onChange({
      ...content,
      images: { ...images, items: [...items, { src: '', alt: '', label: '' }] },
    })
  }

  const removeItem = (index: number) => {
    onChange({
      ...content,
      images: { ...images, items: items.filter((_, i) => i !== index) },
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section Label</label>
          <input
            type="text"
            value={content.label || ''}
            onChange={(e) => onChange({ ...content, label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Campus Life"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="More than a school"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (2nd line)</label>
          <input
            type="text"
            value={content.titleSub || ''}
            onChange={(e) => onChange({ ...content, titleSub: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="a second home"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <textarea
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="A brief description..."
        />
      </div>

      {/* Main Image */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
        <p className="text-sm font-medium text-gray-700">Main Image (large, featured)</p>
        {images.main?.src && (
          <img src={images.main.src} alt={images.main.alt || ''} className="w-full h-32 object-cover rounded-lg" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, 'main')}
          disabled={uploading === 'main'}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={images.main?.label || ''}
            onChange={(e) => updateMain('label', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Label (e.g. Interactive Classrooms)"
          />
          <input
            type="text"
            value={images.main?.alt || ''}
            onChange={(e) => updateMain('alt', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Alt text"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={images.main?.tag || ''}
            onChange={(e) => updateMain('tag', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Tag (e.g. Learning)"
          />
          <input
            type="text"
            value={images.main?.tagDesc || ''}
            onChange={(e) => updateMain('tagDesc', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Tag description"
          />
        </div>
      </div>

      {/* Grid Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Grid Images</label>
          <button onClick={addItem} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add image</button>
        </div>
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((img, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {img.src && (
                  <img src={img.src} alt={img.alt || ''} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, i)}
                    disabled={uploading === `item-${i}`}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={img.label || ''}
                      onChange={(e) => updateItem(i, 'label', e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={img.alt || ''}
                      onChange={(e) => updateItem(i, 'alt', e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                      placeholder="Alt text"
                    />
                  </div>
                </div>
                <button onClick={() => removeItem(i)} className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stat Card */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Stat Card</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content.statCard?.val || ''}
            onChange={(e) => onChange({ ...content, statCard: { ...content.statCard, val: e.target.value, label: content.statCard?.label || '' } })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="15+"
          />
          <input
            type="text"
            value={content.statCard?.label || ''}
            onChange={(e) => onChange({ ...content, statCard: { ...content.statCard, label: e.target.value, val: content.statCard?.val || '' } })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Clubs & Activities"
          />
        </div>
      </div>
    </div>
  )
}
