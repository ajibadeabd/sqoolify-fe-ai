import { useState } from 'react'
import type { ContactSectionContent } from '../../../lib/types'

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

export default function ContactEditor({
  content,
  onChange,
  pageSlug,
}: {
  content: ContactSectionContent
  onChange: (content: ContactSectionContent) => void
  pageSlug?: string
}) {
  const c = content as any
  const info = c.contactInfo || {}

  const set = (key: string, value: any) => onChange({ ...content, [key]: value } as any)
  const updateInfo = (field: string, value: string) => {
    onChange({ ...content, contactInfo: { ...info, [field]: value } } as any)
  }

  const officeHours: { day: string; time: string; note?: string }[] = c.officeHours || []
  const visitReasons: { title: string; desc: string; iconName?: string }[] = c.visitReasons || []

  const updateHour = (index: number, field: string, value: string) => {
    const updated = [...officeHours]
    updated[index] = { ...updated[index], [field]: value }
    set('officeHours', updated)
  }

  const updateReason = (index: number, field: string, value: string) => {
    const updated = [...visitReasons]
    updated[index] = { ...updated[index], [field]: value }
    set('visitReasons', updated)
  }

  return (
    <div className="space-y-6">
      {/* ── Contact Info ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Contact Information</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cards Badge</label>
            <input type="text" value={c.contactCardsBadge || ''} onChange={(e) => set('contactCardsBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Get in Touch" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cards Heading</label>
            <input type="text" value={c.contactCardsHeading || ''} onChange={(e) => set('contactCardsHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contact Details" />
          </div>
        </div>
        <p className="text-xs text-gray-500">Leave blank to use your school's default contact info.</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={info.address || ''} onChange={(e) => updateInfo('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="123 School Street" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={info.phone || ''} onChange={(e) => updateInfo('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="+234 xxx xxx xxxx" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="text" value={info.email || ''} onChange={(e) => updateInfo('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="info@school.com" />
          </div>
        </div>

        {/* Card Titles & Actions */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Card Title</label>
            <input type="text" value={c.addressCardTitle || ''} onChange={(e) => set('addressCardTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Visit Us" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Card Title</label>
            <input type="text" value={c.phoneCardTitle || ''} onChange={(e) => set('phoneCardTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Call Us" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Card Title</label>
            <input type="text" value={c.emailCardTitle || ''} onChange={(e) => set('emailCardTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Email Us" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Action Text</label>
            <input type="text" value={c.addressCardAction || ''} onChange={(e) => set('addressCardAction', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Get directions" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Action Text</label>
            <input type="text" value={c.phoneCardAction || ''} onChange={(e) => set('phoneCardAction', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Call now" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Action Text</label>
            <input type="text" value={c.emailCardAction || ''} onChange={(e) => set('emailCardAction', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Send email" />
          </div>
        </div>
      </fieldset>

      {/* ── Office Hours ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Office Hours</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <input type="text" value={c.officeHoursBadge || ''} onChange={(e) => set('officeHoursBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Office Hours" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input type="text" value={c.officeHoursHeading || ''} onChange={(e) => set('officeHoursHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="When to Visit" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" value={c.officeHoursImage || ''} onChange={(e) => set('officeHoursImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://images.unsplash.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">After Note</label>
            <input type="text" value={c.officeHoursAfterNote || ''} onChange={(e) => set('officeHoursAfterNote', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Walk-ins welcome during office hours" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Response Time Label</label>
            <input type="text" value={c.responseTimeLabel || ''} onChange={(e) => set('responseTimeLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Avg. Response Time" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Response Time Value</label>
            <input type="text" value={c.responseTimeValue || ''} onChange={(e) => set('responseTimeValue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="< 24 hours" />
          </div>
        </div>

        {/* Hours List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Hours</label>
            <button onClick={() => set('officeHours', [...officeHours, { day: '', time: '' }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add hours</button>
          </div>
          {officeHours.map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input type="text" value={item.day} onChange={(e) => updateHour(i, 'day', e.target.value)}
                className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Mon - Fri" />
              <input type="text" value={item.time} onChange={(e) => updateHour(i, 'time', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="8:00 AM - 4:00 PM" />
              <input type="text" value={item.note || ''} onChange={(e) => updateHour(i, 'note', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Note (opt)" />
              <button onClick={() => set('officeHours', officeHours.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      {/* ── Why Visit ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Why Visit</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <input type="text" value={c.visitBadge || ''} onChange={(e) => set('visitBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Why Visit" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input type="text" value={c.visitHeading || ''} onChange={(e) => set('visitHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Reasons to Visit Us" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={c.visitDescription || ''} onChange={(e) => set('visitDescription', e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Description..." />
        </div>

        {/* Visit Reasons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Reasons</label>
            <button onClick={() => set('visitReasons', [...visitReasons, { title: '', desc: '', iconName: 'academic' }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add reason</button>
          </div>
          {visitReasons.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <select value={item.iconName || 'academic'} onChange={(e) => updateReason(i, 'iconName', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs">
                  {ICON_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                <input type="text" value={item.title} onChange={(e) => updateReason(i, 'title', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Reason title" />
                <button onClick={() => set('visitReasons', visitReasons.filter((_, idx) => idx !== i))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <textarea value={item.desc} onChange={(e) => updateReason(i, 'desc', e.target.value)} rows={2}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs resize-none" placeholder="Description" />
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
