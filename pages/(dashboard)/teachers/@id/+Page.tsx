import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { api } from '../../../../lib/api'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Avatar from '../../../../components/ui/Avatar'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'

export default function TeacherDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await api.get<any>(`/teachers/${id}`)
        setTeacher(res.data)
      } catch {
        setTeacher(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchTeacher()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/teachers/${id}`)
      await navigate('/teachers')
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

  if (!teacher) {
    return <div className="text-center py-12 text-gray-500">Teacher not found</div>
  }

  const user = teacher.user || {}

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Teachers', href: '/teachers' }, { label: `${user.firstName || ''} ${user.lastName || ''}` }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/teachers')}>Back</Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex items-center gap-6">
          <Avatar name={`${user.firstName || ''} ${user.lastName || ''}`} size="lg" />
          <div>
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500">Employee ID: {teacher.employeeId}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant={teacher.isActive !== false ? 'success' : 'danger'}>
                {teacher.isActive !== false ? 'Active' : 'Inactive'}
              </Badge>
              {teacher.isClassTeacher && <Badge variant="info">Class Teacher</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card title="Account Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium">{user.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <p className="font-medium">{user.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Employment Date</label>
            <p className="font-medium">{teacher.employmentDate ? new Date(teacher.employmentDate).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </Card>

      {/* Professional Information */}
      <Card title="Professional Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Qualification</label>
            <p className="font-medium">{teacher.qualification || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Level</label>
            <p className="font-medium">{teacher.level || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Experience</label>
            <p className="font-medium">{teacher.experience || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Primary Subject</label>
            <p className="font-medium">{teacher.primarySubject || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-500">Address</label>
            <p className="font-medium">{teacher.address || '-'}</p>
          </div>
        </div>
        {teacher.aboutMe && (
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm text-gray-500">About</label>
            <p className="font-medium">{teacher.aboutMe}</p>
          </div>
        )}
      </Card>

      {/* Assignment Information */}
      <Card title="Assignments">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Assigned Class</label>
            <p className="font-medium">
              {teacher.assignedClass?.name
                ? `${teacher.assignedClass.name}${teacher.assignedClass.section ? ` - ${teacher.assignedClass.section}` : ''}`
                : 'Not assigned'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Subjects</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {teacher.subjects?.length > 0 ? (
                teacher.subjects.map((s: any) => (
                  <span key={s._id} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    {s.name} {s.code && `(${s.code})`}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No subjects assigned</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Classes</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {teacher.classes?.length > 0 ? (
                teacher.classes.map((c: any) => (
                  <span key={c._id} className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                    {c.name}{c.section ? ` - ${c.section}` : ''}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No classes assigned</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
