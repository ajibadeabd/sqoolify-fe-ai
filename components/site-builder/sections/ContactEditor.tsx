import type { ContactSectionContent } from '../../../lib/types'

export default function ContactEditor({
  content,
  onChange,
}: {
  content: ContactSectionContent
  onChange: (content: ContactSectionContent) => void
}) {
  const info = content.contactInfo || {}

  const updateInfo = (field: string, value: string) => {
    onChange({
      ...content,
      contactInfo: { ...info, [field]: value },
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Contact Us"
        />
      </div>
      <p className="text-xs text-gray-500">Leave blank to use your school's default contact info.</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          value={info.address || ''}
          onChange={(e) => updateInfo('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="123 School Street"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="text"
          value={info.phone || ''}
          onChange={(e) => updateInfo('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="+234 xxx xxx xxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="text"
          value={info.email || ''}
          onChange={(e) => updateInfo('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="info@school.com"
        />
      </div>
    </div>
  )
}
