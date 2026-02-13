import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { studentService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Avatar from '../../../../components/ui/Avatar'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import { usePermission } from '../../../../lib/use-permission'

export default function StudentDetailPage() {
  const { can } = usePermission()
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await studentService.getById(id)
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
      await studentService.delete(id)
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
    <div>
      <Breadcrumbs items={[{ label: 'Students', href: '/students' }, { label: `${user.firstName || ''} ${user.lastName || ''}` }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
            <Badge variant={statusColors[student.status] || 'info'}>{student.status || 'active'}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Admission No: {student.admissionNo}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/students')}>Back</Button>
          {can('write_students') && (
            <Button variant="primary" onClick={() => navigate(`/students/${id}/edit`)}>Edit</Button>
          )}
          {can('delete_students') && (
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
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

          {/* Personal Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
          </Card>

          {/* Parent / Guardian */}
          {parent._id && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent / Guardian</h3>
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
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>

            <div className="space-y-3">
              {/* Name + Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Student</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-lg">{user.firstName} {user.lastName}</p>
                  <Badge variant={statusColors[student.status] || 'info'}>{student.status || 'active'}</Badge>
                </div>
              </div>

              {/* Gender + Blood Group */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg ${student.gender === 'female' ? 'bg-pink-50' : 'bg-sky-50'}`}>
                  <p className={`text-xs mb-1 ${student.gender === 'female' ? 'text-pink-600' : 'text-sky-600'}`}>Gender</p>
                  <p className={`font-medium text-sm capitalize ${student.gender === 'female' ? 'text-pink-700' : 'text-sky-700'}`}>
                    {student.gender || '-'}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Blood Group</p>
                  <p className="font-medium text-red-700 text-sm">{student.bloodGroup || '-'}</p>
                </div>
              </div>

              {/* Class */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Class</p>
                <p className="font-medium text-blue-700 text-sm">
                  {student.class?.name || 'Not assigned'}
                  {student.class?.section && ` - ${student.class.section}`}
                </p>
              </div>

              {/* Email */}
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 mb-1">Email</p>
                <p className="font-medium text-purple-700 text-sm">{user.email || '-'}</p>
              </div>

              {/* Phone */}
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 mb-1">Phone</p>
                <p className="font-medium text-green-700 text-sm">{user.phone || '-'}</p>
              </div>

              {/* Admission Date */}
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-600 mb-1">Admission Date</p>
                <p className="font-medium text-orange-700 text-sm">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
                </p>
              </div>

              {/* Language */}
              {student.language && (
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-600 mb-1">Language</p>
                  <p className="font-medium text-indigo-700 text-sm">{student.language}</p>
                </div>
              )}

              {/* Address */}
              {student.address && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-700">{student.address}</p>
                </div>
              )}

              {/* Hobbies */}
              {student.hobbies?.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Hobbies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {student.hobbies.map((hobby: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{hobby}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

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
