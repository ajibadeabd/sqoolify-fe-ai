import type { CTASectionContent } from '../../../lib/types'

export default function CTAEditor({
  content,
  onChange,
}: {
  content: CTASectionContent
  onChange: (content: CTASectionContent) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ready to Join Us?"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={content.description || ''}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Join our school community today"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={content.backgroundColor || '#3B82F6'}
            onChange={(e) => onChange({ ...content, backgroundColor: e.target.value })}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={content.backgroundColor || '#3B82F6'}
            onChange={(e) => onChange({ ...content, backgroundColor: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            placeholder="#3B82F6"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
          <input
            type="text"
            value={content.primaryButtonText || ''}
            onChange={(e) => onChange({ ...content, primaryButtonText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Get Started"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Link</label>
          <input
            type="text"
            value={content.primaryButtonLink || ''}
            onChange={(e) => onChange({ ...content, primaryButtonLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="/login"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
          <input
            type="text"
            value={content.secondaryButtonText || ''}
            onChange={(e) => onChange({ ...content, secondaryButtonText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Learn More"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Link</label>
          <input
            type="text"
            value={content.secondaryButtonLink || ''}
            onChange={(e) => onChange({ ...content, secondaryButtonLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="/about"
          />
        </div>
      </div>
    </div>
  )
}
