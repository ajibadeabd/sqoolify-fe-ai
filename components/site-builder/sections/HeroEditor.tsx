import { useState } from 'react'
import type { HeroSectionContent } from '../../../lib/types'
import { fileService } from '../../../lib/api-services'
import { toast } from 'sonner'

export default function HeroEditor({
  content,
  onChange,
}: {
  content: HeroSectionContent
  onChange: (content: HeroSectionContent) => void
}) {
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await fileService.upload(file)
      onChange({ ...content, backgroundImage: res.data.url })
      toast.success('Image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Welcome to Our School"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Excellence in education since 1995"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
        {content.backgroundImage && (
          <img src={content.backgroundImage} alt="Background" className="w-full h-32 object-cover rounded-lg mb-2" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
          <input
            type="text"
            value={content.ctaText || ''}
            onChange={(e) => onChange({ ...content, ctaText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Learn More"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
          <input
            type="text"
            value={content.ctaLink || ''}
            onChange={(e) => onChange({ ...content, ctaLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="/about"
          />
        </div>
      </div>
    </div>
  )
}
