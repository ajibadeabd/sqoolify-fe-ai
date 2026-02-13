import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { noticeService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import { useAppConfig } from '../../../../lib/use-app-config'

export default function AddNoticePage() {
  const { noticeVisibility: visibilityOptions, noticeTypes } = useAppConfig()
  const [form, setForm] = useState({
    title: '',
    content: '',
    notificationType: 'general',
    isPinned: false,
    expiresAt: '',
  })
  const [visibility, setVisibility] = useState<string[]>(['everyone'])
  const [loading, setLoading] = useState(false)

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

    setLoading(true)

    try {
      await noticeService.create({
        title: form.title,
        content: form.content,
        notificationType: form.notificationType,
        isPinned: form.isPinned,
        visibility: visibility,
        expiresAt: form.expiresAt || undefined,
      })

      toast.success('Notice created successfully')
      await navigate('/notices')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create notice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Notices', href: '/notices' }, { label: 'Add Notice' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Notice</h1>
          <p className="text-sm text-gray-500 mt-1">Post an announcement to the notice board</p>
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
                <div className="flex flex-wrap gap-3">
                  {noticeTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update('notificationType', type)}
                      className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all capitalize ${
                        form.notificationType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Visible To</label>
                <div className="flex flex-wrap gap-2">
                  {visibilityOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleVisibility(opt)}
                      className={`px-4 py-2 rounded-full border transition-all capitalize ${
                        visibility.includes(opt)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{opt}</span>
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
                <Button type="submit" loading={loading} className="flex-1 sm:flex-none">
                  Publish Notice
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
            <div className="rounded-lg border-2 p-4 bg-gray-50 border-gray-200">
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

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tips</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Use clear, concise titles</li>
                <li>• Select appropriate visibility for your audience</li>
                <li>• Pin important notices to keep them visible</li>
                <li>• Set expiry dates for time-sensitive announcements</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
