import { useState } from 'react'
import type { FAQSectionContent, FAQItem, FAQCategory } from '../../../lib/types'

const PRESET_COLORS = ['#2E5090', '#3A7D44', '#0891B2', '#7C3AED', '#EA580C', '#DC2626']
const PRESET_ICONS = ['📋', '🎓', '🏫', '💰', '❓', '📞', '🏆', '📚', '🚌', '🔒']

export default function FAQEditor({
  content,
  onChange,
}: {
  content: FAQSectionContent
  onChange: (content: FAQSectionContent) => void
}) {
  const categories = content.categories || []
  const [newItem, setNewItem] = useState<FAQItem>({ question: '', answer: '', category: '' })
  const [newCat, setNewCat] = useState<FAQCategory>({ name: '', icon: '', color: PRESET_COLORS[0] })
  const [showCatForm, setShowCatForm] = useState(false)

  const addCategory = () => {
    if (!newCat.name.trim()) return
    if (categories.some((c) => c.name === newCat.name.trim())) return
    onChange({
      ...content,
      categories: [...categories, { ...newCat, name: newCat.name.trim() }],
    })
    setNewCat({ name: '', icon: '', color: PRESET_COLORS[(categories.length + 1) % PRESET_COLORS.length] })
    setShowCatForm(false)
  }

  const removeCategory = (name: string) => {
    onChange({
      ...content,
      categories: categories.filter((c) => c.name !== name),
      faqs: (content.faqs || []).map((f) =>
        f.category === name ? { ...f, category: '' } : f
      ),
    })
  }

  const addItem = () => {
    if (!newItem.question.trim() || !newItem.answer.trim()) return
    onChange({
      ...content,
      faqs: [...(content.faqs || []), { ...newItem }],
    })
    setNewItem({ question: '', answer: '', category: newItem.category })
  }

  const removeItem = (index: number) => {
    onChange({
      ...content,
      faqs: (content.faqs || []).filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, updates: Partial<FAQItem>) => {
    onChange({
      ...content,
      faqs: (content.faqs || []).map((f, i) => (i === index ? { ...f, ...updates } : f)),
    })
  }

  return (
    <div className="space-y-5">
      {/* Title & Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Frequently Asked Questions"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Find answers to the most common queries"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL (optional)</label>
        <input
          type="text"
          value={content.backgroundImage || ''}
          onChange={(e) => onChange({ ...content, backgroundImage: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="https://example.com/campus.jpg"
        />
      </div>

      {/* Categories */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800">Categories</label>
          <button
            onClick={() => setShowCatForm(!showCatForm)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showCatForm ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: cat.color || '#2E5090' }}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
                <button
                  onClick={() => removeCategory(cat.name)}
                  className="ml-1 w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {showCatForm && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm"
                  placeholder="Admissions"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Icon (emoji)</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newCat.icon || ''}
                    onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="📋"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color</label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewCat({ ...newCat, color: c })}
                    className={`w-6 h-6 rounded-full transition-all ${
                      newCat.color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-1.5 mt-1">
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-500">Quick icons:</label>
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewCat({ ...newCat, icon })}
                    className={`w-7 h-7 rounded text-sm hover:bg-gray-200 transition ${
                      newCat.icon === icon ? 'bg-gray-200' : ''
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={addCategory}
              disabled={!newCat.name.trim()}
              className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Add Category
            </button>
          </div>
        )}
      </div>

      {/* Existing FAQs */}
      {(content.faqs || []).length > 0 && (
        <div className="border-t pt-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            FAQs ({(content.faqs || []).length})
          </label>
          <div className="space-y-2">
            {(content.faqs || []).map((f, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{
                      backgroundColor: f.category
                        ? categories.find((c) => c.name === f.category)?.color || '#D1D5DB'
                        : '#D1D5DB',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-gray-900">{f.question}</span>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{f.answer}</p>
                    {categories.length > 0 && (
                      <select
                        value={f.category || ''}
                        onChange={(e) => updateItem(i, { category: e.target.value })}
                        className="mt-2 text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
                      >
                        <option value="">No category</option>
                        {categories.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.icon ? `${c.icon} ` : ''}{c.name}
                          </option>
                        ))}
                      </select>
                    )}
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
        </div>
      )}

      {/* Add FAQ */}
      <div className="p-3 border border-dashed border-gray-300 rounded-lg space-y-2">
        <p className="text-xs font-medium text-gray-500">Add FAQ</p>
        <input
          type="text"
          value={newItem.question}
          onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="What is the admission process?"
        />
        <textarea
          value={newItem.answer}
          onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={3}
          placeholder="Provide a detailed answer..."
        />
        {categories.length > 0 && (
          <select
            value={newItem.category || ''}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select category (optional)</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.icon ? `${c.icon} ` : ''}{c.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={addItem}
          disabled={!newItem.question.trim() || !newItem.answer.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add FAQ
        </button>
      </div>
    </div>
  )
}
