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
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await fileService.upload(file)
      onChange({
        ...content,
        images: [...(content.images || []), { url: res.data.url, caption: '' }],
      })
      toast.success('Image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    onChange({
      ...content,
      images: (content.images || []).filter((_, i) => i !== index),
    })
  }

  const updateCaption = (index: number, caption: string) => {
    const images = [...(content.images || [])]
    images[index] = { ...images[index], caption }
    onChange({ ...content, images })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Our Gallery"
        />
      </div>

      {/* Image grid */}
      {(content.images || []).length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(content.images || []).map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.url} alt={img.caption || ''} className="w-full h-24 object-cover rounded-lg" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <input
                type="text"
                value={img.caption || ''}
                onChange={(e) => updateCaption(i, e.target.value)}
                className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="Caption"
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      </div>
    </div>
  )
}
