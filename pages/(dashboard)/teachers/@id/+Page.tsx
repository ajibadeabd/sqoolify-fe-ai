import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { teacherService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Avatar from '../../../../components/ui/Avatar'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import Modal from '../../../../components/ui/Modal'
import PermissionManager from '../../../../components/permissions/PermissionManager'
import { useAuth } from '../../../../lib/auth-context'
import { usePermission } from '../../../../lib/use-permission'

export default function TeacherDetailPage() {
  const pageContext = usePageContext()
  useAuth()
  const id = (pageContext.routeParams as any)?.id
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(false)

  const { can } = usePermission()

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await teacherService.getById(id)
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
      await teacherService.delete(id)
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
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
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/teachers')}>Back</Button>
            {can('write_users') && <Button variant="primary" onClick={() => navigate(`/teachers/${id}/edit`)}>Edit</Button>}
            {can('write_users') && <Button variant="primary" onClick={() => setRoleModalOpen(true)}>Manage Role</Button>}
            {can('write_users') && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
          </div>

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

          {/* Assignments */}
          <Card title="Assignments">
            <div className="grid sm:grid-cols-2 gap-6">
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
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Name */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
              <p className="mt-1 text-lg font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
            </div>

            {/* Qualification & Level - 2-col grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-purple-50 p-4">
                <p className="text-xs font-medium text-purple-500 uppercase tracking-wide">Qualification</p>
                <p className="mt-1 text-sm font-semibold text-purple-700">{teacher.qualification || '-'}</p>
              </div>
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-xs font-medium text-green-500 uppercase tracking-wide">Level</p>
                <p className="mt-1 text-sm font-semibold text-green-700">{teacher.level || '-'}</p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">Employee ID</p>
              <p className="mt-1 text-lg font-semibold text-blue-700">{teacher.employeeId || '-'}</p>
            </div>

            {/* Primary Subject */}
            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-xs font-medium text-orange-500 uppercase tracking-wide">Primary Subject</p>
              <p className="mt-1 text-lg font-semibold text-orange-700">{teacher.primarySubject || '-'}</p>
            </div>

            {/* Email */}
            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">Email</p>
              <p className="mt-1 text-sm font-semibold text-indigo-700 break-all">{user.email || '-'}</p>
            </div>

            {/* Phone */}
            <div className="rounded-xl bg-sky-50 p-4">
              <p className="text-xs font-medium text-sky-500 uppercase tracking-wide">Phone</p>
              <p className="mt-1 text-lg font-semibold text-sky-700">{user.phone || '-'}</p>
            </div>

            {/* Employment Date */}
            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Employment Date</p>
              <p className="mt-1 text-lg font-semibold text-yellow-700">
                {teacher.employmentDate ? new Date(teacher.employmentDate).toLocaleDateString() : '-'}
              </p>
            </div>

            {/* Experience */}
            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wide">Experience</p>
              <p className="mt-1 text-lg font-semibold text-teal-700">{teacher.experience || '-'}</p>
            </div>

            {/* Address (conditional) */}
            {teacher.address && (
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                <p className="mt-1 text-sm font-semibold text-gray-700">{teacher.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permissions & Role Management Modal */}
      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="Manage Role & Permissions" size="xl">
        <PermissionManager
          userId={user._id}
          currentPermissions={user.permissions || []}
          embedded
          onUpdate={async () => {
            try {
              const res = await teacherService.getById(id)
              setTeacher(res.data)
            } catch (err) {
              // Silently fail, permission update already succeeded
            }
          }}
        />
      </Modal>

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
