import { useState } from 'react'
import type { TextSectionContent } from '../../../lib/types'

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

export default function TextEditor({
  content,
  onChange,
  pageSlug,
}: {
  content: TextSectionContent
  onChange: (content: TextSectionContent) => void
  pageSlug?: string
}) {
  const c = content as any

  const set = (key: string, value: any) => onChange({ ...content, [key]: value } as any)
  const setNested = (parent: string, key: string, value: any) =>
    onChange({ ...content, [parent]: { ...(c[parent] || {}), [key]: value } } as any)

  if (pageSlug === 'about') return <AboutFields c={c} set={set} setNested={setNested} onChange={onChange} />
  if (pageSlug === 'admissions') return <AdmissionsFields c={c} set={set} onChange={onChange} />
  if (pageSlug === 'news') return <NewsFields c={c} set={set} onChange={onChange} />
  return <HomeFields content={content} onChange={onChange} />
}

/* ═══════════════════════════════════════════════
   HOME — default fields (label, title, para1, etc.)
   ═══════════════════════════════════════════════ */
function HomeFields({ content, onChange }: { content: TextSectionContent; onChange: (c: TextSectionContent) => void }) {
  const stats = content.stats || []

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
            placeholder="Our Story"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Building a legacy of excellence"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title Highlight</label>
          <input
            type="text"
            value={content.titleHighlight || ''}
            onChange={(e) => onChange({ ...content, titleHighlight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="since day one"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 1</label>
        <textarea
          value={content.para1 || content.content || ''}
          onChange={(e) => onChange({ ...content, para1: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="First paragraph of content..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 2</label>
        <textarea
          value={content.para2 || ''}
          onChange={(e) => onChange({ ...content, para2: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Second paragraph (optional)..."
        />
      </div>

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
                  placeholder="Years of Impact"
                />
                <button onClick={() => removeStat(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content.link?.text || ''}
            onChange={(e) => onChange({ ...content, link: { ...content.link, text: e.target.value, href: content.link?.href || '' } })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Read our full story"
          />
          <input
            type="text"
            value={content.link?.href || ''}
            onChange={(e) => onChange({ ...content, link: { ...content.link, href: e.target.value, text: content.link?.text || '' } })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="/about"
          />
        </div>
      </div>

      {/* Floating Card */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Floating Card</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content.floatingCard?.val || ''}
            onChange={(e) => onChange({ ...content, floatingCard: { ...content.floatingCard, val: e.target.value, label: content.floatingCard?.label || '' } })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="A+"
          />
          <input
            type="text"
            value={content.floatingCard?.label || ''}
            onChange={(e) => onChange({ ...content, floatingCard: { ...content.floatingCard, label: e.target.value, val: content.floatingCard?.val || '' } })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Average Grade"
          />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ABOUT — story, timeline, mission/vision, approach
   ═══════════════════════════════════════════════ */
function AboutFields({
  c, set, setNested, onChange,
}: {
  c: any
  set: (k: string, v: any) => void
  setNested: (p: string, k: string, v: any) => void
  onChange: (c: any) => void
}) {
  const timeline: { title: string; desc: string }[] = c.timeline || []
  const approachItems: { title: string; desc: string }[] = c.approachItems || []

  const updateArrayItem = (arr: any[], key: string, index: number, field: string, value: string) => {
    const updated = [...arr]
    updated[index] = { ...updated[index], [field]: value }
    set(key, updated)
  }

  return (
    <div className="space-y-6">
      {/* ── Story Section ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Our Story</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Badge</label>
            <input type="text" value={c.storyBadge || ''} onChange={(e) => set('storyBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Our Story" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Heading</label>
            <input type="text" value={c.storyHeading || ''} onChange={(e) => set('storyHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="A legacy of academic excellence" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Story Image URL</label>
          <input type="text" value={c.storyImage || ''} onChange={(e) => set('storyImage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://images.unsplash.com/..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation Title</label>
            <input type="text" value={c.accreditationTitle || ''} onChange={(e) => set('accreditationTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Nationally Accredited" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation Description</label>
            <input type="text" value={c.accreditationDesc || ''} onChange={(e) => set('accreditationDesc', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Meeting highest standards" />
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Timeline</label>
            <button onClick={() => set('timeline', [...timeline, { title: '', desc: '' }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add item</button>
          </div>
          {timeline.map((item, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <input type="text" value={item.title} onChange={(e) => updateArrayItem(timeline, 'timeline', i, 'title', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="2010" />
              <input type="text" value={item.desc} onChange={(e) => updateArrayItem(timeline, 'timeline', i, 'desc', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="School founded..." />
              <button onClick={() => set('timeline', timeline.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      {/* ── Mission & Vision ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Mission & Vision</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Badge</label>
            <input type="text" value={c.missionVisionBadge || ''} onChange={(e) => set('missionVisionBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Our Purpose" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Heading</label>
            <input type="text" value={c.missionVisionHeading || ''} onChange={(e) => set('missionVisionHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Mission & Vision" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mission Label</label>
            <input type="text" value={c.missionLabel || ''} onChange={(e) => set('missionLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Our Mission" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vision Label</label>
            <input type="text" value={c.visionLabel || ''} onChange={(e) => set('visionLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Our Vision" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mission Text</label>
          <textarea value={c.missionText || ''} onChange={(e) => set('missionText', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="To provide..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vision Text</label>
          <textarea value={c.visionText || ''} onChange={(e) => set('visionText', e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="To be a leading..." />
        </div>
      </fieldset>

      {/* ── Approach ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Our Approach</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approach Badge</label>
            <input type="text" value={c.approachBadge || ''} onChange={(e) => set('approachBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Our Approach" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approach Heading</label>
            <input type="text" value={c.approachHeading || ''} onChange={(e) => set('approachHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="How we educate" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Approach Image URL</label>
          <input type="text" value={c.approachImage || ''} onChange={(e) => set('approachImage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://images.unsplash.com/..." />
        </div>

        {/* Approach Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Approach Items</label>
            <button onClick={() => set('approachItems', [...approachItems, { title: '', desc: '' }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add item</button>
          </div>
          {approachItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <input type="text" value={item.title} onChange={(e) => updateArrayItem(approachItems, 'approachItems', i, 'title', e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Title" />
              <input type="text" value={item.desc} onChange={(e) => updateArrayItem(approachItems, 'approachItems', i, 'desc', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Description" />
              <button onClick={() => set('approachItems', approachItems.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Approach Testimonial */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Approach Quote Card</label>
          <div className="space-y-2">
            <textarea value={c.approachTestimonial?.quote || ''} onChange={(e) => setNested('approachTestimonial', 'quote', e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" placeholder="Quote text..." />
            <div className="flex gap-2">
              <input type="text" value={c.approachTestimonial?.initials || ''} onChange={(e) => setNested('approachTestimonial', 'initials', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="JD" />
              <input type="text" value={c.approachTestimonial?.label || ''} onChange={(e) => setNested('approachTestimonial', 'label', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Parent, Year 5" />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMISSIONS — steps, docs, age requirements
   ═══════════════════════════════════════════════ */
function AdmissionsFields({
  c, set, onChange,
}: {
  c: any
  set: (k: string, v: any) => void
  onChange: (c: any) => void
}) {
  const steps: { step: string; title: string; desc: string; iconName?: string }[] = c.admissionSteps || []
  const docs: string[] = c.requiredDocs || []
  const ages: { level: string; age: string }[] = c.ageRequirements || []
  const [newDoc, setNewDoc] = useState('')

  const updateStep = (index: number, field: string, value: string) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], [field]: value }
    set('admissionSteps', updated)
  }

  return (
    <div className="space-y-6">
      {/* ── Admission Steps ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Admission Steps</legend>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <input type="text" value={c.stepsBadge || ''} onChange={(e) => set('stepsBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="How to Apply" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input type="text" value={c.stepsHeading || ''} onChange={(e) => set('stepsHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Simple Admission Process" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading Sub</label>
            <input type="text" value={c.stepsHeadingSub || ''} onChange={(e) => set('stepsHeadingSub', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="join our family" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Steps</label>
            <button onClick={() => set('admissionSteps', [...steps, { step: `Step ${steps.length + 1}`, title: '', desc: '', iconName: 'academic' }])}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add step</button>
          </div>
          {steps.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <input type="text" value={item.step} onChange={(e) => updateStep(i, 'step', e.target.value)}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Step 1" />
                <select value={item.iconName || 'academic'} onChange={(e) => updateStep(i, 'iconName', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs">
                  {ICON_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                <input type="text" value={item.title} onChange={(e) => updateStep(i, 'title', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Step title" />
                <button onClick={() => set('admissionSteps', steps.filter((_, idx) => idx !== i))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <textarea value={item.desc} onChange={(e) => updateStep(i, 'desc', e.target.value)} rows={2}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs resize-none" placeholder="Step description" />
            </div>
          ))}
        </div>
      </fieldset>

      {/* ── Required Documents ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Required Documents</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <input type="text" value={c.docsBadge || ''} onChange={(e) => set('docsBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Required Documents" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input type="text" value={c.docsHeading || ''} onChange={(e) => set('docsHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What You'll Need" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Documents</label>
          </div>
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input type="text" value={doc} onChange={(e) => { const updated = [...docs]; updated[i] = e.target.value; set('requiredDocs', updated) }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button onClick={() => set('requiredDocs', docs.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input type="text" value={newDoc} onChange={(e) => setNewDoc(e.target.value)}
              className="flex-1 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm" placeholder="Add document..." />
            <button onClick={() => { if (newDoc.trim()) { set('requiredDocs', [...docs, newDoc.trim()]); setNewDoc('') } }}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition" disabled={!newDoc.trim()}>Add</button>
          </div>
        </div>
      </fieldset>

      {/* ── Age Requirements ── */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Age Requirements</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <input type="text" value={c.ageBadge || ''} onChange={(e) => set('ageBadge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Age Guidelines" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input type="text" value={c.ageHeading || ''} onChange={(e) => set('ageHeading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Age Requirements" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Levels</label>
            <button onClick={() => set('ageRequirements', [...ages, { level: '', age: '' }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add level</button>
          </div>
          {ages.map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input type="text" value={item.level} onChange={(e) => { const updated = [...ages]; updated[i] = { ...updated[i], level: e.target.value }; set('ageRequirements', updated) }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nursery" />
              <input type="text" value={item.age} onChange={(e) => { const updated = [...ages]; updated[i] = { ...updated[i], age: e.target.value }; set('ageRequirements', updated) }}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="3-4 years" />
              <button onClick={() => set('ageRequirements', ages.filter((_, idx) => idx !== i))} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   NEWS — featured badge, grid, news items
   ═══════════════════════════════════════════════ */
function NewsFields({
  c, set, onChange,
}: {
  c: any
  set: (k: string, v: any) => void
  onChange: (c: any) => void
}) {
  const newsItems: { id: string; title: string; excerpt: string; date: string; category?: string; image?: string }[] = c.newsItems || []

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...newsItems]
    updated[index] = { ...updated[index], [field]: value }
    set('newsItems', updated)
  }

  const addItem = () => {
    set('newsItems', [...newsItems, { id: `news-${Date.now()}`, title: '', excerpt: '', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), category: '', image: '' }])
  }

  return (
    <div className="space-y-6">
      {/* Labels */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Featured Badge</label>
          <input type="text" value={c.featuredBadge || ''} onChange={(e) => set('featuredBadge', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Featured Story" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grid Badge</label>
          <input type="text" value={c.gridBadge || ''} onChange={(e) => set('gridBadge', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Latest Updates" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grid Heading</label>
          <input type="text" value={c.gridHeading || ''} onChange={(e) => set('gridHeading', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="News & Events" />
        </div>
      </div>

      {/* Empty state */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empty Title</label>
          <input type="text" value={c.emptyTitle || ''} onChange={(e) => set('emptyTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="No news yet" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empty Description</label>
          <input type="text" value={c.emptyDescription || ''} onChange={(e) => set('emptyDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Check back soon..." />
        </div>
      </div>

      {/* News Items */}
      <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">News Items</legend>
        {newsItems.map((item, i) => (
          <div key={item.id || i} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input type="text" value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="News title" />
              <input type="text" value={item.category || ''} onChange={(e) => updateItem(i, 'category', e.target.value)}
                className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Category" />
              <button onClick={() => set('newsItems', newsItems.filter((_, idx) => idx !== i))} className="p-1 text-red-500 hover:bg-red-50 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <textarea value={item.excerpt} onChange={(e) => updateItem(i, 'excerpt', e.target.value)} rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs resize-none" placeholder="Brief description..." />
            <div className="flex gap-2">
              <input type="text" value={item.date} onChange={(e) => updateItem(i, 'date', e.target.value)}
                className="w-40 px-3 py-1.5 border border-gray-300 rounded-lg text-xs" placeholder="January 15, 2025" />
              <input type="text" value={item.image || ''} onChange={(e) => updateItem(i, 'image', e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs" placeholder="Image URL (optional)" />
            </div>
          </div>
        ))}
        <button onClick={addItem}
          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition">
          + Add News Item
        </button>
      </fieldset>
    </div>
  )
}
