import type { CTASectionContent } from '../../../lib/types'

export default function CTAEditor({
  content,
  onChange,
}: {
  content: CTASectionContent
  onChange: (content: CTASectionContent) => void
}) {
  const buttons = content.buttons || []

  const updateButton = (index: number, field: string, value: string) => {
    const updated = [...buttons]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, buttons: updated })
  }

  const addButton = () => {
    onChange({ ...content, buttons: [...buttons, { text: '', link: '', variant: 'primary' as const }] })
  }

  const removeButton = (index: number) => {
    onChange({ ...content, buttons: buttons.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
        <input
          type="text"
          value={content.badge || ''}
          onChange={(e) => onChange({ ...content, badge: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Limited spaces available"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
        <textarea
          value={content.headline || ''}
          onChange={(e) => onChange({ ...content, headline: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Your child's future starts with a single step"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={content.description || ''}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Join the families who have trusted us..."
        />
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Buttons</label>
          {buttons.length < 2 && (
            <button onClick={addButton} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add button</button>
          )}
        </div>
        {buttons.length > 0 && (
          <div className="space-y-2">
            {buttons.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={b.text}
                  onChange={(e) => updateButton(i, 'text', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Button text"
                />
                <input
                  type="text"
                  value={b.link}
                  onChange={(e) => updateButton(i, 'link', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="/admissions"
                />
                <select
                  value={b.variant}
                  onChange={(e) => updateButton(i, 'variant', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
                <button onClick={() => removeButton(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
