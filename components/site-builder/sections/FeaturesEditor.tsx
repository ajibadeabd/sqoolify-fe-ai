import { useState } from 'react'
import type { FeaturesSectionContent, FeatureItem } from '../../../lib/types'

const ICON_OPTIONS = [
  { value: 'academic', label: 'Academic' },
  { value: 'stem', label: 'STEM / Science' },
  { value: 'sports', label: 'Sports' },
  { value: 'faculty', label: 'Faculty / Staff' },
  { value: 'safe', label: 'Safety / Shield' },
  { value: 'portal', label: 'Portal / Device' },
  { value: 'excellence', label: 'Excellence' },
  { value: 'integrity', label: 'Integrity' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'compassion', label: 'Compassion' },
  { value: 'learning', label: 'Learning' },
  { value: 'community', label: 'Community' },
  { value: 'curriculum', label: 'Curriculum' },
  { value: 'meals', label: 'Meals' },
  { value: 'transport', label: 'Transport' },
  { value: 'health', label: 'Health' },
  { value: 'technology', label: 'Technology' },
  { value: 'extracurricular', label: 'Extracurricular' },
]

export default function FeaturesEditor({
  content,
  onChange,
  pageSlug,
}: {
  content: FeaturesSectionContent
  onChange: (content: FeaturesSectionContent) => void
  pageSlug?: string
}) {
  const [newFeature, setNewFeature] = useState<FeatureItem>({ title: '', description: '', iconName: 'academic' })

  const addFeature = () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) return
    onChange({
      ...content,
      features: [...(content.features || []), { ...newFeature }],
    })
    setNewFeature({ title: '', description: '', iconName: 'academic' })
  }

  const removeFeature = (index: number) => {
    onChange({
      ...content,
      features: (content.features || []).filter((_, i) => i !== index),
    })
  }

  const updateFeature = (index: number, field: string, value: string) => {
    const updated = [...(content.features || [])]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, features: updated })
  }

  const c = content as any
  const set = (key: string, value: any) => onChange({ ...content, [key]: value } as any)

  return (
    <div className="space-y-5">
      {pageSlug === 'about' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Values Badge</label>
            <input type="text" value={c.valuesBadge || ''} onChange={(e) => set('valuesBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Core Values" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Values Heading</label>
            <input type="text" value={c.valuesHeading || ''} onChange={(e) => set('valuesHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What We Stand For" />
          </div>
        </div>
      ) : pageSlug === 'admissions' ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Included Badge</label>
              <input type="text" value={c.includedBadge || ''} onChange={(e) => set('includedBadge', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What's Included" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Included Heading</label>
              <input type="text" value={c.includedHeading || ''} onChange={(e) => set('includedHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Everything Your Child Needs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Sub</label>
              <input type="text" value={c.includedHeadingSub || ''} onChange={(e) => set('includedHeadingSub', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="to thrive" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={c.includedDescription || ''} onChange={(e) => set('includedDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="We provide comprehensive..." />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Label</label>
              <input
                type="text"
                value={content.label || ''}
                onChange={(e) => onChange({ ...content, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Why Our School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => onChange({ ...content, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="An education designed for"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Highlight</label>
              <input
                type="text"
                value={content.titleHighlight || ''}
                onChange={(e) => onChange({ ...content, titleHighlight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="real-world success"
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
        </>
      )}

      {/* Existing features */}
      {(content.features || []).length > 0 && (
        <div className="space-y-2">
          {(content.features || []).map((f, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={f.iconName || 'academic'}
                      onChange={(e) => updateFeature(i, 'iconName', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={f.title}
                      onChange={(e) => updateFeature(i, 'title', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      placeholder="Feature title"
                    />
                  </div>
                  <textarea
                    value={f.description}
                    onChange={(e) => updateFeature(i, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs resize-none"
                    rows={2}
                    placeholder="Description"
                  />
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
            </div>
          ))}
        </div>
      )}

      {/* Add new feature */}
      <div className="p-3 border border-dashed border-gray-300 rounded-lg space-y-2">
        <p className="text-xs font-medium text-gray-500">Add Feature</p>
        <div className="flex items-center gap-2">
          <select
            value={newFeature.iconName || 'academic'}
            onChange={(e) => setNewFeature({ ...newFeature, iconName: e.target.value })}
            className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={newFeature.title}
            onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Feature title"
          />
        </div>
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
