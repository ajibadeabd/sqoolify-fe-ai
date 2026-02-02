import { useState, useEffect, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { classService, studentService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import SearchBar from '../../../../components/ui/SearchBar'
import { usePermission } from '../../../../lib/use-permission'

export default function ClassDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const [cls, setCls] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Assign modal state
  const [assignOpen, setAssignOpen] = useState(false)
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([])
  const [assignSearch, setAssignSearch] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [selectedToAssign, setSelectedToAssign] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)

  // Remove state
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set())
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetchClass = useCallback(async () => {
    try {
      const res = await classService.getById(id)
      setCls(res.data)
    } catch {
      setCls(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchClass()
  }, [id, fetchClass])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await classService.delete(id)
      await navigate('/classes')
    } catch {
      setDeleting(false)
    }
  }

  const fetchUnassigned = useCallback(async (search?: string) => {
    setAssignLoading(true)
    try {
      const res = await studentService.getAll({ unassigned: true, limit: 50, search: search || undefined })
      setUnassignedStudents(res.data || [])
    } catch {
      setUnassignedStudents([])
    } finally {
      setAssignLoading(false)
    }
  }, [])

  const openAssignModal = () => {
    setAssignOpen(true)
    setAssignSearch('')
    setSelectedToAssign(new Set())
    fetchUnassigned()
  }

  const toggleAssignSelect = (studentId: string) => {
    setSelectedToAssign((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const toggleAssignAll = () => {
    if (selectedToAssign.size === unassignedStudents.length) {
      setSelectedToAssign(new Set())
    } else {
      setSelectedToAssign(new Set(unassignedStudents.map((s) => s._id)))
    }
  }

  const handleBulkAssign = async () => {
    if (selectedToAssign.size === 0) return
    setAssigning(true)
    try {
      const res = await studentService.bulkAssignClass(Array.from(selectedToAssign), id)
      const { success, failed } = res.data as any
      if (success > 0) toast.success(`${success} student${success > 1 ? 's' : ''} assigned to class`)
      if (failed > 0) toast.error(`Failed to assign ${failed} student${failed > 1 ? 's' : ''}`)
    } catch {
      toast.error('Failed to assign students')
    }
    setAssigning(false)
    setSelectedToAssign(new Set())
    setAssignOpen(false)
    await fetchClass()
  }

  const toggleRemoveSelect = (studentId: string) => {
    setSelectedToRemove((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const toggleRemoveAll = () => {
    const students = cls?.students || []
    if (selectedToRemove.size === students.length) {
      setSelectedToRemove(new Set())
    } else {
      setSelectedToRemove(new Set(students.map((s: any) => s._id)))
    }
  }

  const handleBulkRemove = async () => {
    if (selectedToRemove.size === 0) return
    setRemoving(true)
    try {
      const res = await studentService.bulkRemoveClass(Array.from(selectedToRemove))
      const { success, failed } = res.data as any
      if (success > 0) toast.success(`${success} student${success > 1 ? 's' : ''} removed from class`)
      if (failed > 0) toast.error(`Failed to remove ${failed} student${failed > 1 ? 's' : ''}`)
    } catch {
      toast.error('Failed to remove students')
    }
    setRemoving(false)
    setSelectedToRemove(new Set())
    setRemoveOpen(false)
    await fetchClass()
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

  const students = cls.students || []

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Classes', href: '/classes' }, { label: cls.name }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/classes')}>Back</Button>
          {can('write_classes') && <Button variant="primary" onClick={() => navigate(`/classes/${id}/edit`)}>Edit</Button>}
          {can('delete_classes') && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
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
            <p className="font-medium">{students.length}</p>
          </div>
        </div>

        {/* Students Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Students</h3>
            <div className="flex gap-2">
              {can('write_students') && selectedToRemove.size > 0 && (
                <Button variant="danger" onClick={() => setRemoveOpen(true)}>
                  Remove {selectedToRemove.size} Student{selectedToRemove.size > 1 ? 's' : ''}
                </Button>
              )}
              {can('write_students') && (
                <Button variant="outline" onClick={openAssignModal}>+ Assign Students</Button>
              )}
            </div>
          </div>

          {students.length > 0 ? (
            <div>
              {can('write_students') && students.length > 1 && (
                <label className="flex items-center gap-2 mb-3 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedToRemove.size === students.length}
                    onChange={toggleRemoveAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Select all
                </label>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student: any) => (
                  <div
                    key={student._id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 transition ${
                      selectedToRemove.has(student._id) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {can('write_students') && (
                        <input
                          type="checkbox"
                          checked={selectedToRemove.has(student._id)}
                          onChange={() => toggleRemoveSelect(student._id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500 shrink-0"
                        />
                      )}
                      <div
                        className="flex-1 cursor-pointer min-w-0"
                        onClick={() => navigate(`/students/${student._id}`)}
                      >
                        <p className="font-medium truncate">{student.user?.firstName} {student.user?.lastName}</p>
                        <p className="text-sm text-gray-500">Admission: {student.admissionNo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No students assigned to this class</p>
              {can('write_students') && (
                <Button variant="outline" className="mt-3" onClick={openAssignModal}>
                  + Assign Students
                </Button>
              )}
            </div>
          )}
        </div>

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

      {/* Assign Students Modal */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assign Students to {cls.name}</h3>
                <button onClick={() => setAssignOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Select students to assign to this class</p>
              <div className="mt-3">
                <SearchBar
                  value={assignSearch}
                  onChange={(val) => {
                    setAssignSearch(val)
                    setSelectedToAssign(new Set())
                    fetchUnassigned(val)
                  }}
                  placeholder="Search by admission number..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {assignLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : unassignedStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No unassigned students found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unassignedStudents.length > 1 && (
                    <label className="flex items-center gap-2 mb-3 text-sm text-gray-600 cursor-pointer px-3">
                      <input
                        type="checkbox"
                        checked={selectedToAssign.size === unassignedStudents.length}
                        onChange={toggleAssignAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Select all ({unassignedStudents.length})
                    </label>
                  )}
                  {unassignedStudents.map((student) => (
                    <label
                      key={student._id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        selectedToAssign.has(student._id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedToAssign.has(student._id)}
                        onChange={() => toggleAssignSelect(student._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{student.user?.firstName} {student.user?.lastName}</p>
                        <p className="text-xs text-gray-500">{student.admissionNo}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-3">
              <Button
                variant="primary"
                onClick={handleBulkAssign}
                loading={assigning}
                disabled={selectedToAssign.size === 0 || assigning}
                className="flex-1"
              >
                Assign {selectedToAssign.size > 0 ? `(${selectedToAssign.size})` : ''}
              </Button>
              <Button variant="outline" onClick={() => setAssignOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Remove Confirmation */}
      <ConfirmDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={handleBulkRemove}
        title="Remove Students"
        message={`Remove ${selectedToRemove.size} student${selectedToRemove.size > 1 ? 's' : ''} from ${cls.name}? They will become unassigned.`}
        loading={removing}
      />

      {/* Delete Class Confirmation */}
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
