import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { noticeService } from '../../../../../lib/api-services'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone', icon: '🌐' },
  { value: 'staff', label: 'Staff Only', icon: '👨‍🏫' },
  { value: 'teacher', label: 'Teachers', icon: '📚' },
  { value: 'student', label: 'Students', icon: '🎓' },
  { value: 'parent', label: 'Parents', icon: '👪' },
]

const NOTIFICATION_TYPES = [
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '📢' },
  { value: 'info', label: 'Information', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'ℹ️' },
  { value: 'academic', label: 'Academic', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '📚' },
  { value: 'event', label: 'Event', color: 'bg-green-100 text-green-700 border-green-200', icon: '📅' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-700 border-red-200', icon: '🚨' },
]

export default function EditNoticePage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

  const [form, setForm] = useState({
    title: '',
    content: '',
    notificationType: 'general',
    isPinned: false,
    expiresAt: '',
  })
  const [visibility, setVisibility] = useState<string[]>(['everyone'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchNotice = async () => {
      try {
        const res = await noticeService.getById(id)
        const n = res.data
        setForm({
          title: n.title || '',
          content: n.content || '',
          notificationType: n.notificationType || 'general',
          isPinned: n.isPinned || false,
          expiresAt: n.expiresAt ? n.expiresAt.split('T')[0] : '',
        })
        setVisibility(n.visibility || ['everyone'])
      } catch {
        toast.error('Failed to load notice')
        navigate('/notices')
      } finally {
        setLoading(false)
      }
    }
    fetchNotice()
  }, [id])

  const update = (key: string, value: string | boolean) => setForm({ ...form, [key]: value })

  const toggleVisibility = (value: string) => {
    if (value === 'everyone') {
      setVisibility(['everyone'])
    } else {
      const filtered = visibility.filter((v) => v !== 'everyone')
      if (filtered.includes(value)) {
        setVisibility(filtered.filter((v) => v !== value))
      } else {
        setVisibility([...filtered, value])
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (visibility.length === 0) {
      toast.error('Please select at least one visibility option')
      return
    }

    setSaving(true)

    try {
      await noticeService.update(id, {
        title: form.title,
        content: form.content,
        notificationType: form.notificationType,
        isPinned: form.isPinned,
        visibility: visibility,
        expiresAt: form.expiresAt || undefined,
      })
      toast.success('Notice updated successfully')
      await navigate('/notices')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update notice')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Notices', href: '/notices' }, { label: 'Edit Notice' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Notice</h1>
          <p className="text-sm text-gray-500 mt-1">Update this announcement</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Notice Title"
                  value={form.title}
                  onChange={(e) => update('title', (e.target as HTMLInputElement).value)}
                  placeholder="Enter a clear, descriptive title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notice Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => update('content', e.target.value)}
                  placeholder="Write your notice content here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Notification Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {NOTIFICATION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => update('notificationType', type.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        form.notificationType === type.value
                          ? `${type.color} border-current`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl mb-1 block">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Visible To</label>
                <div className="flex flex-wrap gap-2">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleVisibility(opt.value)}
                      className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                        visibility.includes(opt.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Input
                    label="Expiry Date (Optional)"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => update('expiresAt', (e.target as HTMLInputElement).value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(e) => update('isPinned', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Pin Notice</span>
                      <p className="text-xs text-gray-500">Keep at top of notice board</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={saving} className="flex-1 sm:flex-none">
                  Update Notice
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/notices')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className={`rounded-lg border-2 p-4 ${
              NOTIFICATION_TYPES.find((t) => t.value === form.notificationType)?.color || 'bg-gray-50'
            }`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">
                  {form.title || 'Notice Title'}
                </h4>
                {form.isPinned && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Pinned</span>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {form.content || 'Your notice content will appear here...'}
              </p>
              <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-current/10">
                {visibility.map((v) => (
                  <span key={v} className="text-xs bg-white/50 px-2 py-0.5 rounded-full capitalize">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
