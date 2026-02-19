import type { TextSectionContent } from '../../../lib/types'

export default function TextEditor({
  content,
  onChange,
}: {
  content: TextSectionContent
  onChange: (content: TextSectionContent) => void
}) {
  const stats = content.stats || []

  const updateStat = (index: number, field: 'val' | 'label', value: string) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, stats: updated })
  }

  const addStat = () => {
    onChange({ ...content, stats: [...stats, { val: '', label: '' }] })
  }

  const removeStat = (index: number) => {
    onChange({ ...content, stats: stats.filter((_, i) => i !== index) })
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
            placeholder="Our Story"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Building a legacy of excellence"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title Highlight</label>
          <input
            type="text"
            value={content.titleHighlight || ''}
            onChange={(e) => onChange({ ...content, titleHighlight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="since day one"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 1</label>
        <textarea
          value={content.para1 || content.content || ''}
          onChange={(e) => onChange({ ...content, para1: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="First paragraph of content..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 2</label>
        <textarea
          value={content.para2 || ''}
          onChange={(e) => onChange({ ...content, para2: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Second paragraph (optional)..."
        />
      </div>

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Stats</label>
          <button onClick={addStat} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add stat</button>
        </div>
        {stats.length > 0 && (
          <div className="space-y-2">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={s.val}
                  onChange={(e) => updateStat(i, 'val', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="20+"
                />
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => updateStat(i, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Years of Impact"
                />
                <button onClick={() => removeStat(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content.link?.text || ''}
            onChange={(e) => onChange({ ...content, link: { ...content.link, text: e.target.value, href: content.link?.href || '' } })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Read our full story"
          />
          <input
            type="text"
            value={content.link?.href || ''}
            onChange={(e) => onChange({ ...content, link: { ...content.link, href: e.target.value, text: content.link?.text || '' } })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="/about"
          />
        </div>
      </div>

      {/* Floating Card */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Floating Card</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content.floatingCard?.val || ''}
            onChange={(e) => onChange({ ...content, floatingCard: { ...content.floatingCard, val: e.target.value, label: content.floatingCard?.label || '' } })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="A+"
          />
          <input
            type="text"
            value={content.floatingCard?.label || ''}
            onChange={(e) => onChange({ ...content, floatingCard: { ...content.floatingCard, label: e.target.value, val: content.floatingCard?.val || '' } })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Average Grade"
          />
        </div>
      </div>
    </div>
  )
}
