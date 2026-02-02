import { useState, useEffect, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { subjectService, teacherService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import SearchBar from '../../../../components/ui/SearchBar'
import { usePermission } from '../../../../lib/use-permission'

export default function SubjectDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const [subject, setSubject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Assign teacher modal state
  const [assignOpen, setAssignOpen] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [assignSearch, setAssignSearch] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)

  // Remove teacher state
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetchSubject = useCallback(async () => {
    try {
      const res = await subjectService.getById(id)
      setSubject(res.data)
    } catch {
      setSubject(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchSubject()
  }, [id, fetchSubject])

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

  const fetchTeachers = useCallback(async (search?: string) => {
    setAssignLoading(true)
    try {
      const res = await teacherService.getAll({ limit: 50, search: search || undefined })
      setTeachers(res.data || [])
    } catch {
      setTeachers([])
    } finally {
      setAssignLoading(false)
    }
  }, [])

  const openAssignModal = () => {
    setAssignOpen(true)
    setAssignSearch('')
    setSelectedTeacher(null)
    fetchTeachers()
  }

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return
    setAssigning(true)
    try {
      await subjectService.assignTeacher(id, selectedTeacher)
      toast.success('Teacher assigned to subject')
      setAssignOpen(false)
      setSelectedTeacher(null)
      await fetchSubject()
    } catch {
      toast.error('Failed to assign teacher')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveTeacher = async () => {
    setRemoving(true)
    try {
      await subjectService.removeTeacher(id)
      toast.success('Teacher removed from subject')
      setRemoveOpen(false)
      await fetchSubject()
    } catch {
      toast.error('Failed to remove teacher')
    } finally {
      setRemoving(false)
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
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <Badge variant={subject.isActive !== false ? 'success' : 'danger'}>
              {subject.isActive !== false ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {subject.description && (
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-sm text-gray-500">Description</label>
              <p className="font-medium">{subject.description}</p>
            </div>
          )}
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
            {teacherUser ? (
              <div className="flex items-center gap-3 mt-1">
                <div
                  className="flex-1 cursor-pointer hover:text-blue-600 transition"
                  onClick={() => navigate(`/teachers/${teacher._id}`)}
                >
                  <p className="font-medium">{teacherUser.firstName} {teacherUser.lastName}</p>
                  {teacherUser.email && <p className="text-sm text-gray-500">{teacherUser.email}</p>}
                </div>
                {can('write_subjects') && (
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={openAssignModal}>Change</Button>
                    <Button variant="danger" size="sm" onClick={() => setRemoveOpen(true)}>Remove</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-gray-400">Not assigned</p>
                {can('write_subjects') && (
                  <Button variant="outline" size="sm" className="mt-2" onClick={openAssignModal}>
                    + Assign Teacher
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Assign Teacher Modal */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assign Teacher to {subject.name}</h3>
                <button onClick={() => setAssignOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Select a teacher to assign to this subject</p>
              <div className="mt-3">
                <SearchBar
                  value={assignSearch}
                  onChange={(val) => {
                    setAssignSearch(val)
                    setSelectedTeacher(null)
                    fetchTeachers(val)
                  }}
                  placeholder="Search teachers..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {assignLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No teachers found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teachers.map((t) => {
                    const tUser = t.user && typeof t.user === 'object' ? t.user : null
                    if (!tUser) return null
                    const isCurrentTeacher = teacher?._id === t._id
                    return (
                      <label
                        key={t._id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                          selectedTeacher === t._id ? 'border-blue-300 bg-blue-50' : isCurrentTeacher ? 'border-gray-200 bg-gray-50 opacity-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="assignTeacher"
                          checked={selectedTeacher === t._id}
                          onChange={() => setSelectedTeacher(t._id)}
                          disabled={isCurrentTeacher}
                          className="text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {tUser.firstName} {tUser.lastName}
                            {isCurrentTeacher && <span className="text-xs text-gray-400 ml-2">(current)</span>}
                          </p>
                          {tUser.email && <p className="text-xs text-gray-500">{tUser.email}</p>}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-3">
              <Button
                variant="primary"
                onClick={handleAssignTeacher}
                loading={assigning}
                disabled={!selectedTeacher || assigning}
                className="flex-1"
              >
                Assign Teacher
              </Button>
              <Button variant="outline" onClick={() => setAssignOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Teacher Confirmation */}
      <ConfirmDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={handleRemoveTeacher}
        title="Remove Teacher"
        message={`Remove ${teacherUser ? `${teacherUser.firstName} ${teacherUser.lastName}` : 'this teacher'} from ${subject.name}?`}
        loading={removing}
      />

      {/* Delete Subject Confirmation */}
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
