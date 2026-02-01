import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { subjectService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import { usePermission } from '../../../../lib/use-permission'

export default function SubjectDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const [subject, setSubject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await subjectService.getById(id)
        setSubject(res.data)
      } catch {
        setSubject(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchSubject()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await subjectService.delete(id)
      toast.success('Subject deleted')
      await navigate('/subjects')
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

  if (!subject) {
    return <div className="text-center py-12 text-gray-500">Subject not found</div>
  }

  const teacher = typeof subject.teacher === 'object' ? subject.teacher : null
  const teacherUser = teacher?.user && typeof teacher.user === 'object' ? teacher.user : null
  const cls = typeof subject.class === 'object' ? subject.class : null

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Subjects', href: '/subjects' }, { label: subject.name }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subject Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/subjects')}>Back</Button>
          {can('write_subjects') && <Button variant="primary" onClick={() => navigate(`/subjects/${id}/edit`)}>Edit</Button>}
          {can('delete_subjects') && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
        </div>
      </div>

      <Card title="Subject Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="font-medium">{subject.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Code</label>
            <p className="font-medium">{subject.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Type</label>
            <Badge variant={subject.isCore ? 'info' : 'default'}>
              {subject.isCore ? 'Core' : 'Elective'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card title="Assignment">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Class</label>
            <p className="font-medium">
              {cls ? `${cls.name}${cls.section ? ` - ${cls.section}` : ''}` : 'Not assigned'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Teacher</label>
            <p className="font-medium">
              {teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'Not assigned'}
            </p>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete ${subject.name}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
