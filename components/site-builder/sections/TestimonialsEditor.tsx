import { useState } from 'react'
import type { TestimonialsSectionContent, TestimonialItem } from '../../../lib/types'

export default function TestimonialsEditor({
  content,
  onChange,
}: {
  content: TestimonialsSectionContent
  onChange: (content: TestimonialsSectionContent) => void
}) {
  const [newItem, setNewItem] = useState<TestimonialItem>({ name: '', role: '', initials: '', quote: '' })

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.quote.trim()) return
    const initials = newItem.initials || newItem.name.split(' ').map((w) => w[0]).join('').toUpperCase()
    onChange({
      ...content,
      testimonials: [...(content.testimonials || []), { ...newItem, initials }],
    })
    setNewItem({ name: '', role: '', initials: '', quote: '' })
  }

  const removeItem = (index: number) => {
    onChange({
      ...content,
      testimonials: (content.testimonials || []).filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...(content.testimonials || [])]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, testimonials: updated })
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
            placeholder="Testimonials"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Trusted by families"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (2nd line)</label>
          <input
            type="text"
            value={content.titleSub || ''}
            onChange={(e) => onChange({ ...content, titleSub: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="across the community"
          />
        </div>
      </div>

      {/* Existing testimonials */}
      {(content.testimonials || []).length > 0 && (
        <div className="space-y-2">
          {(content.testimonials || []).map((t, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {t.initials || t.name?.split(' ').map((w: string) => w[0]).join('') || '?'}
                    </span>
                    <div>
                      <span className="font-medium text-sm">{t.name}</span>
                      {t.role && <span className="text-xs text-gray-400 ml-2">{t.role}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 ml-10">"{t.quote}"</p>
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
            </div>
          ))}
        </div>
      )}

      {/* Add new testimonial */}
      <div className="p-3 border border-dashed border-gray-300 rounded-lg space-y-2">
        <p className="text-xs font-medium text-gray-500">Add Testimonial</p>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Name"
          />
          <input
            type="text"
            value={newItem.role || ''}
            onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Role (e.g. Parent)"
          />
          <input
            type="text"
            value={newItem.initials || ''}
            onChange={(e) => setNewItem({ ...newItem, initials: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Initials (auto)"
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
