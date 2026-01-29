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

export default function StudentDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get<any>(`/students/${id}`)
        setStudent(res.data)
      } catch {
        setStudent(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchStudent()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/students/${id}`)
      await navigate('/students')
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

  if (!student) {
    return <div className="text-center py-12 text-gray-500">Student not found</div>
  }

  const user = student.user || {}
  const parent = student.parent || {}
  const parentUser = parent.user || {}

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
    inactive: 'warning',
    graduated: 'info',
    transferred: 'warning',
    suspended: 'danger',
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Students', href: '/students' }, { label: `${user.firstName || ''} ${user.lastName || ''}` }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/students')}>Back</Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex items-center gap-6">
          {student.photo ? (
            <img src={student.photo} alt={`${user.firstName} ${user.lastName}`} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <Avatar name={`${user.firstName || ''} ${user.lastName || ''}`} size="lg" />
          )}
          <div>
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500">Admission No: {student.admissionNo}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant={statusColors[student.status] || 'info'}>{student.status || 'active'}</Badge>
              {student.rowNumber && <Badge variant="info">{`Row #${student.rowNumber}`}</Badge>}
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
            <label className="text-sm text-gray-500">Admission Date</label>
            <p className="font-medium">{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card title="Personal Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Gender</label>
            <p className="font-medium capitalize">{student.gender || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Date of Birth</label>
            <p className="font-medium">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Blood Group</label>
            <p className="font-medium">{student.bloodGroup || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Language</label>
            <p className="font-medium">{student.language || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-500">Address</label>
            <p className="font-medium">{student.address || '-'}</p>
          </div>
        </div>
        {student.aboutMe && (
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm text-gray-500">About</label>
            <p className="font-medium">{student.aboutMe}</p>
          </div>
        )}
        {student.hobbies?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm text-gray-500">Hobbies</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {student.hobbies.map((hobby: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">{hobby}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Academic Information */}
      <Card title="Academic Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Class</label>
            <p className="font-medium">
              {student.class?.name || 'Not assigned'}
              {student.class?.section && ` - ${student.class.section}`}
            </p>
          </div>
        </div>
      </Card>

      {/* Parent Information */}
      {parent._id && (
        <Card title="Parent / Guardian">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p className="font-medium">{parentUser.firstName} {parentUser.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{parentUser.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="font-medium">{parentUser.phone || '-'}</p>
            </div>
            {parent.relationship && (
              <div>
                <label className="text-sm text-gray-500">Relationship</label>
                <p className="font-medium capitalize">{parent.relationship}</p>
              </div>
            )}
            {parent.occupation && (
              <div>
                <label className="text-sm text-gray-500">Occupation</label>
                <p className="font-medium">{parent.occupation}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
