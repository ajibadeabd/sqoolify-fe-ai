import type { HeroSectionContent } from '../../../lib/types'

export default function HeroEditor({
  content,
  onChange,
  pageSlug,
}: {
  content: HeroSectionContent
  onChange: (content: HeroSectionContent) => void
  pageSlug?: string
}) {
  const stats = content.stats || []
  const buttons = content.buttons || []

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
          placeholder="Admissions Open — 2025/2026"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
          <input
            type="text"
            value={content.headline || ''}
            onChange={(e) => onChange({ ...content, headline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Shaping tomorrow's"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline (2nd line)</label>
          <input
            type="text"
            value={content.headlineSub || ''}
            onChange={(e) => onChange({ ...content, headlineSub: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="leaders, today."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={content.description || ''}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="A short description about the school..."
        />
      </div>

      {pageSlug && pageSlug !== 'home' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Background Image URL</label>
          <input
            type="text"
            value={(content as any).heroImage || ''}
            onChange={(e) => onChange({ ...content, heroImage: e.target.value } as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      )}

      {pageSlug === 'contact' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Button Text</label>
          <input
            type="text"
            value={(content as any).buttonText || ''}
            onChange={(e) => onChange({ ...content, buttonText: e.target.value } as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Send us a message"
          />
        </div>
      )}

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
                  placeholder="Years"
                />
                <button onClick={() => removeStat(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
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
