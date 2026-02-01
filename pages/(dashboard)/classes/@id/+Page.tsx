import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { classService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'

export default function ClassDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [cls, setCls] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await classService.getById(id)
        setCls(res.data)
      } catch {
        setCls(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchClass()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await classService.delete(id)
      await navigate('/classes')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  }

  if (!cls) {
    return <div className="text-center py-12 text-gray-500">Class not found</div>
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Classes', href: '/classes' }, { label: cls.name }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/classes')}>Back</Button>
          <Button variant="primary" onClick={() => navigate(`/classes/${id}/edit`)}>Edit</Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{cls.name}</h2>
          {cls.section && <Badge variant="info">{cls.section}</Badge>}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Section</label>
            <p className="font-medium">{cls.section || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Class Teacher</label>
            <p className="font-medium">
              {cls.classTeacher?.user
                ? `${cls.classTeacher.user.firstName} ${cls.classTeacher.user.lastName}`
                : 'Not assigned'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Capacity</label>
            <p className="font-medium">{cls.capacity || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Total Students</label>
            <p className="font-medium">{cls.students?.length || 0}</p>
          </div>
        </div>

        {cls.students && cls.students.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Students</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cls.students.map((student: any) => (
                <div
                  key={student._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/students/${student._id}`)}
                >
                  <p className="font-medium">{student.user?.firstName} {student.user?.lastName}</p>
                  <p className="text-sm text-gray-500">Admission: {student.admissionNo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {cls.subjects && cls.subjects.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {cls.subjects.map((subject: any) => (
                <Badge key={subject._id} variant="default">{subject.name}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Are you sure you want to delete ${cls.name}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
