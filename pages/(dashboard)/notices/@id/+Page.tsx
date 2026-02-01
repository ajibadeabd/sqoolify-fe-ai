import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { noticeService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import { usePermission } from '../../../../lib/use-permission'

export default function NoticeDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const [notice, setNotice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await noticeService.getById(id)
        setNotice(res.data)
      } catch {
        setNotice(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchNotice()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await noticeService.delete(id)
      toast.success('Notice deleted')
      await navigate('/notices')
    } catch {
      setDeleting(false)
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

  if (!notice) {
    return <div className="text-center py-12 text-gray-500">Notice not found</div>
  }

  const typeColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-700',
    info: 'bg-blue-100 text-blue-700',
    academic: 'bg-purple-100 text-purple-700',
    event: 'bg-green-100 text-green-700',
    emergency: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    urgent: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-700',
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Notices', href: '/notices' }, { label: notice.title }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notice Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/notices')}>Back</Button>
          {can('write_notices') && <Button variant="primary" onClick={() => navigate(`/notices/${id}/edit`)}>Edit</Button>}
          {can('delete_notices') && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">{notice.title}</h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              {notice.isPinned && <Badge variant="info">Pinned</Badge>}
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${typeColors[notice.notificationType] || 'bg-gray-100 text-gray-700'}`}>
                {notice.notificationType || 'general'}
              </span>
            </div>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>

          <div className="border-t pt-4 grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-gray-500">Visibility</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {notice.visibility?.map((v: string) => (
                  <span key={v} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize text-xs">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-500">Created</label>
              <p className="font-medium">{formatDate(notice.createdAt)}</p>
            </div>
            <div>
              <label className="text-gray-500">Expires</label>
              <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                {notice.expiresAt ? formatDate(notice.expiresAt) : 'No expiration'}
                {isExpired && ' (Expired)'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Notice"
        message={`Are you sure you want to delete "${notice.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
