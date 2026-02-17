import { useState } from 'react'
import type { FeaturesSectionContent, FeatureItem } from '../../../lib/types'

export default function FeaturesEditor({
  content,
  onChange,
}: {
  content: FeaturesSectionContent
  onChange: (content: FeaturesSectionContent) => void
}) {
  const [newFeature, setNewFeature] = useState<FeatureItem>({ title: '', description: '', icon: '' })

  const addFeature = () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) return
    onChange({
      ...content,
      features: [...(content.features || []), { ...newFeature }],
    })
    setNewFeature({ title: '', description: '', icon: '' })
  }

  const removeFeature = (index: number) => {
    onChange({
      ...content,
      features: (content.features || []).filter((_, i) => i !== index),
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What We Offer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
          <select
            value={content.columns || 3}
            onChange={(e) => onChange({ ...content, columns: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional subtitle text"
        />
      </div>

      {/* Existing features */}
      {(content.features || []).length > 0 && (
        <div className="space-y-2">
          {(content.features || []).map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {f.icon && <span className="text-lg">{f.icon}</span>}
                  <span className="font-medium text-sm">{f.title}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{f.description}</p>
              </div>
              <button
                onClick={() => removeFeature(i)}
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

      {/* Add new feature */}
      <div className="p-3 border border-dashed border-gray-300 rounded-lg space-y-2">
        <p className="text-xs font-medium text-gray-500">Add Feature</p>
        <input
          type="text"
          value={newFeature.icon || ''}
          onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Icon (emoji, e.g. 🎓)"
        />
        <input
          type="text"
          value={newFeature.title}
          onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Feature title"
        />
        <textarea
          value={newFeature.description}
          onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
          placeholder="Feature description"
        />
        <button
          onClick={addFeature}
          disabled={!newFeature.title.trim() || !newFeature.description.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add Feature
        </button>
      </div>
    </div>
  )
}
