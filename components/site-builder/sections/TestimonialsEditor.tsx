import { useState } from 'react'
import type { TestimonialsSectionContent, TestimonialItem } from '../../../lib/types'

export default function TestimonialsEditor({
  content,
  onChange,
}: {
  content: TestimonialsSectionContent
  onChange: (content: TestimonialsSectionContent) => void
}) {
  const [newItem, setNewItem] = useState<TestimonialItem>({ name: '', role: '', quote: '' })

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.quote.trim()) return
    onChange({
      ...content,
      testimonials: [...(content.testimonials || []), { ...newItem }],
    })
    setNewItem({ name: '', role: '', quote: '' })
  }

  const removeItem = (index: number) => {
    onChange({
      ...content,
      testimonials: (content.testimonials || []).filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="What People Say"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Hear from our community"
        />
      </div>

      {(content.testimonials || []).length > 0 && (
        <div className="space-y-2">
          {(content.testimonials || []).map((t, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{t.name}</span>
                  {t.role && <span className="text-xs text-gray-400">{t.role}</span>}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">"{t.quote}"</p>
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
        <p className="text-xs font-medium text-gray-500">Add Testimonial</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Person's name"
          />
          <input
            type="text"
            value={newItem.role || ''}
            onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Role (e.g. Parent, Alumni)"
          />
        </div>
        <textarea
          value={newItem.quote}
          onChange={(e) => setNewItem({ ...newItem, quote: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
          placeholder="Their testimonial quote..."
        />
        <button
          onClick={addItem}
          disabled={!newItem.name.trim() || !newItem.quote.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add Testimonial
        </button>
      </div>
    </div>
  )
}
