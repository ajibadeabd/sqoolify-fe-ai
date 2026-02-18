import { useState } from 'react'
import type { TeamSectionContent, TeamMember } from '../../../lib/types'
import { fileService } from '../../../lib/api-services'

export default function TeamEditor({
  content,
  onChange,
}: {
  content: TeamSectionContent
  onChange: (content: TeamSectionContent) => void
}) {
  const [newItem, setNewItem] = useState<TeamMember>({ name: '', role: '', bio: '' })
  const [uploading, setUploading] = useState(false)

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.role.trim()) return
    onChange({
      ...content,
      members: [...(content.members || []), { ...newItem }],
    })
    setNewItem({ name: '', role: '', bio: '' })
  }

  const removeItem = (index: number) => {
    onChange({
      ...content,
      members: (content.members || []).filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (index: number, file: File) => {
    setUploading(true)
    try {
      const res = await fileService.upload(file)
      const updated = [...(content.members || [])]
      updated[index] = { ...updated[index], image: res.data.url }
      onChange({ ...content, members: updated })
    } catch {
      // silently fail
    } finally {
      setUploading(false)
    }
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
          placeholder="Meet Our Team"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Dedicated educators shaping the future"
        />
      </div>

      {(content.members || []).length > 0 && (
        <div className="space-y-2">
          {(content.members || []).map((m, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="shrink-0">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <label className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(i, e.target.files[0])}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{m.name}</span>
                <p className="text-xs text-gray-400">{m.role}</p>
                {m.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{m.bio}</p>}
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
        <p className="text-xs font-medium text-gray-500">Add Team Member</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Full name"
          />
          <input
            type="text"
            value={newItem.role}
            onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Role (e.g. Principal)"
          />
        </div>
        <textarea
          value={newItem.bio || ''}
          onChange={(e) => setNewItem({ ...newItem, bio: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
          placeholder="Short bio (optional)"
        />
        <button
          onClick={addItem}
          disabled={!newItem.name.trim() || !newItem.role.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add Member
        </button>
      </div>
    </div>
  )
}
