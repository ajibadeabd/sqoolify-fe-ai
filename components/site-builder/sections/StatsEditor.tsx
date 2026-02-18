import { useState } from 'react'
import type { StatsSectionContent, StatItem } from '../../../lib/types'

export default function StatsEditor({
  content,
  onChange,
}: {
  content: StatsSectionContent
  onChange: (content: StatsSectionContent) => void
}) {
  const [newItem, setNewItem] = useState<StatItem>({ value: '', label: '', icon: '' })

  const addItem = () => {
    if (!newItem.value.trim() || !newItem.label.trim()) return
    onChange({
      ...content,
      stats: [...(content.stats || []), { ...newItem }],
    })
    setNewItem({ value: '', label: '', icon: '' })
  }

  const removeItem = (index: number) => {
    onChange({
      ...content,
      stats: (content.stats || []).filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Our School in Numbers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={content.backgroundColor || '#3B82F6'}
              onChange={(e) => onChange({ ...content, backgroundColor: e.target.value })}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
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
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Achievements we're proud of"
        />
      </div>

      {(content.stats || []).length > 0 && (
        <div className="space-y-2">
          {(content.stats || []).map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0 flex items-center gap-3">
                {s.icon && <span className="text-lg">{s.icon}</span>}
                <span className="font-bold text-sm">{s.value}</span>
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
              <button
                onClick={() => removeItem(i)}
                className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 border border-dashed border-gray-300 rounded-lg space-y-2">
        <p className="text-xs font-medium text-gray-500">Add Stat</p>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={newItem.icon || ''}
            onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Icon (e.g. 🎓)"
          />
          <input
            type="text"
            value={newItem.value}
            onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="500+"
          />
          <input
            type="text"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Students Enrolled"
          />
        </div>
        <button
          onClick={addItem}
          disabled={!newItem.value.trim() || !newItem.label.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add Stat
        </button>
      </div>
    </div>
  )
}
