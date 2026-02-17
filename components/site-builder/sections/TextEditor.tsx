import type { TextSectionContent } from '../../../lib/types'

export default function TextEditor({
  content,
  onChange,
}: {
  content: TextSectionContent
  onChange: (content: TextSectionContent) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="About Our School"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={content.content || ''}
          onChange={(e) => onChange({ ...content, content: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your content here..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
        <select
          value={content.alignment || 'left'}
          onChange={(e) => onChange({ ...content, alignment: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  )
}
