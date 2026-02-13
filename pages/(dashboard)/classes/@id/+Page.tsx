import { useState, useEffect, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { classService, studentService, teacherService, subjectService } from '../../../../lib/api-services'
import { useAppConfig } from '../../../../lib/use-app-config'
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
  const { classLevels } = useAppConfig()
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

  // Assign teacher state
  const [teacherModalOpen, setTeacherModalOpen] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [teacherSearch, setTeacherSearch] = useState('')
  const [teacherLoading, setTeacherLoading] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [assigningTeacher, setAssigningTeacher] = useState(false)

  // Assign subject state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([])
  const [subjectSearch, setSubjectSearch] = useState('')
  const [subjectLoading, setSubjectLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedSubjectTeachers, setSelectedSubjectTeachers] = useState<Set<string>>(new Set())
  const [assigningSubject, setAssigningSubject] = useState(false)

  // Remove subject state
  const [removeSubjectId, setRemoveSubjectId] = useState<string | null>(null)
  const [removingSubject, setRemovingSubject] = useState(false)

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

  const fetchTeachers = useCallback(async (search?: string) => {
    setTeacherLoading(true)
    try {
      const res = await teacherService.getAll({ limit: 50, search: search || undefined })
      setTeachers(res.data || [])
    } catch {
      setTeachers([])
    } finally {
      setTeacherLoading(false)
    }
  }, [])

  const openTeacherModal = () => {
    setTeacherModalOpen(true)
    setTeacherSearch('')
    setSelectedTeacher(cls?.classTeacher?._id || '')
    fetchTeachers()
  }

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return
    setAssigningTeacher(true)
    try {
      await classService.assignTeacher(id, selectedTeacher)
      toast.success('Class teacher assigned')
      setTeacherModalOpen(false)
      await fetchClass()
    } catch {
      toast.error('Failed to assign teacher')
    }
    setAssigningTeacher(false)
  }

  const fetchAvailableSubjects = useCallback(async (search?: string) => {
    setSubjectLoading(true)
    try {
      const res = await subjectService.getAll({ limit: 50, search: search || undefined })
      setAvailableSubjects(res.data || [])
    } catch {
      setAvailableSubjects([])
    } finally {
      setSubjectLoading(false)
    }
  }, [])

  const openSubjectModal = () => {
    setSubjectModalOpen(true)
    setSubjectSearch('')
    setSelectedSubject('')
    setSelectedSubjectTeachers(new Set())
    fetchAvailableSubjects()
  }

  const handleAssignSubject = async () => {
    if (!selectedSubject) return
    setAssigningSubject(true)
    try {
      const isUpdate = subjects.some((s: any) => {
        const eid = typeof s.subject === 'object' ? s.subject?._id : s.subject
        return eid === selectedSubject
      })
      const teacherIds = isUpdate ? Array.from(selectedSubjectTeachers) : (selectedSubjectTeachers.size > 0 ? Array.from(selectedSubjectTeachers) : undefined)
      await subjectService.assignClass(selectedSubject, id, teacherIds)
      toast.success('Subject assigned to class')
      setSubjectModalOpen(false)
      await fetchClass()
    } catch {
      toast.error('Failed to assign subject')
    }
    setAssigningSubject(false)
  }

  const handleRemoveSubject = async () => {
    if (!removeSubjectId) return
    setRemovingSubject(true)
    try {
      await subjectService.removeClass(removeSubjectId, id)
      toast.success('Subject removed from class')
      setRemoveSubjectId(null)
      await fetchClass()
    } catch {
      toast.error('Failed to remove subject')
    }
    setRemovingSubject(false)
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
  const subjects = cls.subjects || []
  const capacityNum = cls.capacity || 0
  const enrollmentPercent = capacityNum > 0 ? Math.round((students.length / capacityNum) * 100) : 0
  const levelName = cls.level ? classLevels.find((l) => l.shortCode === cls.level)?.name : null

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Classes', href: '/classes' }, { label: cls.name }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{cls.name}</h1>
            {cls.section && (
              <span className="px-2.5 py-0.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">{cls.section}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {levelName ? `${levelName} ` : ''}Class details and student management
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/classes')}>Back</Button>
          {can('write_classes') && <Button variant="primary" size="sm" onClick={() => navigate(`/classes/${id}/edit`)}>Edit</Button>}
          {can('delete_classes') && <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>Delete</Button>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Class Info - First */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Information</h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Class Name</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-lg">{cls.name}</p>
                  {cls.section && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{cls.section}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">Capacity</p>
                  <p className="font-medium text-purple-700 text-sm">
                    {capacityNum > 0 ? `${capacityNum} students` : 'Not set'}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Level</p>
                  <p className="font-medium text-green-700 text-sm">
                    {levelName || cls.level || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Class Teacher</p>
                    <p className="font-medium text-blue-700 text-sm">
                      {cls.classTeacher?.user
                        ? `${cls.classTeacher.user.firstName} ${cls.classTeacher.user.lastName}`
                        : 'Not assigned'}
                    </p>
                  </div>
                  {can('write_classes') && (
                    <button
                      onClick={openTeacherModal}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {cls.classTeacher ? 'Change' : 'Assign'}
                    </button>
                  )}
                </div>
              </div>

              {cls.room && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Classroom</p>
                  <p className="font-medium text-orange-700 text-sm">{cls.room}</p>
                </div>
              )}

              {cls.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{cls.description}</p>
                </div>
              )}

              {/* Enrollment Progress */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Student Enrollment</p>
                  <p className="text-xs font-medium text-gray-700">
                    {students.length}{capacityNum > 0 ? ` / ${capacityNum}` : ''} students
                  </p>
                </div>
                {capacityNum > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        enrollmentPercent > 90 ? 'bg-red-500' : enrollmentPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
                    />
                  </div>
                )}
                {capacityNum > 0 && (
                  <p className={`text-xs mt-1.5 ${
                    enrollmentPercent > 90 ? 'text-red-600' : enrollmentPercent > 70 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {enrollmentPercent}% filled
                  </p>
                )}
              </div>

              {subjects.length > 0 && (
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-600 mb-1">Subjects</p>
                  <p className="font-medium text-indigo-700 text-sm">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} assigned</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Students & Subjects - Second */}
        <div className="lg:col-span-1 space-y-6">
          {/* Students Section */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Students ({students.length})</h3>
              <div className="flex flex-wrap gap-2">
                {can('write_students') && selectedToRemove.size > 0 && (
                  <Button variant="danger" size="sm" onClick={() => setRemoveOpen(true)}>
                    Remove {selectedToRemove.size}
                  </Button>
                )}
                {can('write_students') && (
                  <Button variant="outline" size="sm" onClick={openAssignModal}>+ Assign Students</Button>
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
                <div className="grid sm:grid-cols-2 gap-3">
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
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500 text-sm">No students assigned to this class</p>
                {can('write_students') && (
                  <Button variant="outline" className="mt-3" onClick={openAssignModal}>
                    + Assign Students
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Subjects Section */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subjects ({subjects.length})</h3>
              {can('write_subjects') && (
                <Button variant="outline" size="sm" onClick={openSubjectModal}>+ Assign Subject</Button>
              )}
            </div>
            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.map((entry: any) => {
                  const subjectId = typeof entry.subject === 'object' ? entry.subject?._id : entry.subject
                  return (
                    <div key={subjectId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default">
                            {entry.subject?.code ? `${entry.subject.name} (${entry.subject.code})` : entry.subject?.name || 'Unknown'}
                          </Badge>
                        </div>
                        {entry.teachers?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.teachers.map((t: any) => `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim()).join(', ')}
                          </p>
                        )}
                      </div>
                      {can('write_subjects') && (
                        <Button variant="danger" size="sm" onClick={() => setRemoveSubjectId(subjectId)}>Remove</Button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No subjects assigned to this class</p>
                {can('write_subjects') && (
                  <Button variant="outline" className="mt-3" onClick={openSubjectModal}>+ Assign Subject</Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Assign Teacher Modal */}
      {teacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assign Class Teacher</h3>
                <button onClick={() => setTeacherModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Select a teacher for {cls.name}</p>
              <div className="mt-3">
                <SearchBar
                  value={teacherSearch}
                  onChange={(val) => {
                    setTeacherSearch(val)
                    fetchTeachers(val)
                  }}
                  placeholder="Search teachers..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {teacherLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No teachers found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teachers.map((teacher: any) => (
                    <label
                      key={teacher._id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        selectedTeacher === teacher._id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="classTeacher"
                        checked={selectedTeacher === teacher._id}
                        onChange={() => setSelectedTeacher(teacher._id)}
                        className="text-blue-600 focus:ring-blue-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{teacher.user?.firstName} {teacher.user?.lastName}</p>
                        <p className="text-xs text-gray-500">{teacher.employeeId}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-3">
              <Button
                variant="primary"
                onClick={handleAssignTeacher}
                loading={assigningTeacher}
                disabled={!selectedTeacher || assigningTeacher}
                className="flex-1"
              >
                Assign Teacher
              </Button>
              <Button variant="outline" onClick={() => setTeacherModalOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Assign Subject Modal */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Assign Subject to {cls.name}</h3>
                <button onClick={() => setSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Select a subject to assign to this class</p>
              <div className="mt-3">
                <SearchBar
                  value={subjectSearch}
                  onChange={(val) => {
                    setSubjectSearch(val)
                    setSelectedSubject('')
                    fetchAvailableSubjects(val)
                  }}
                  placeholder="Search subjects..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {subjectLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : availableSubjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No subjects found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableSubjects.map((subj: any) => {
                    const isAlreadyAssigned = subjects.some((s: any) => {
                      const existingId = typeof s.subject === 'object' ? s.subject?._id : s.subject
                      return existingId === subj._id
                    })
                    return (
                      <label
                        key={subj._id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                          selectedSubject === subj._id ? 'border-blue-300 bg-blue-50' : isAlreadyAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="assignSubject"
                          checked={selectedSubject === subj._id}
                          onChange={() => {
                            setSelectedSubject(subj._id)
                            if (isAlreadyAssigned) {
                              const entry = subjects.find((s: any) => {
                                const eid = typeof s.subject === 'object' ? s.subject?._id : s.subject
                                return eid === subj._id
                              })
                              const currentTeachers = (entry?.teachers || []).map((t: any) => typeof t === 'object' ? t._id : t).filter(Boolean)
                              setSelectedSubjectTeachers(new Set(currentTeachers))
                            } else {
                              setSelectedSubjectTeachers(new Set())
                            }
                          }}
                          className="text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {subj.name} {subj.code ? `(${subj.code})` : ''}
                            {isAlreadyAssigned && <span className="text-xs text-green-600 ml-2">(assigned - click to edit teachers)</span>}
                          </p>
                          {subj.teachers?.length > 0 && (
                            <p className="text-xs text-gray-500">
                              Teachers: {subj.teachers.map((t: any) => {
                                const u = typeof t === 'object' && t.user && typeof t.user === 'object' ? t.user : null
                                return u ? `${u.firstName} ${u.lastName}` : ''
                              }).filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Teacher selection when a subject is picked */}
            {selectedSubject && (() => {
              const subj = availableSubjects.find((s: any) => s._id === selectedSubject)
              const subjTeachers = (subj?.teachers || []).filter((t: any) => typeof t === 'object' && t.user && typeof t.user === 'object')
              if (subjTeachers.length === 0) return null
              return (
                <div className="px-6 pb-4 border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select Teachers for this class (optional)</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {subjTeachers.map((t: any) => (
                      <label key={t._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSubjectTeachers.has(t._id)}
                          onChange={() => {
                            const next = new Set(selectedSubjectTeachers)
                            if (next.has(t._id)) next.delete(t._id)
                            else next.add(t._id)
                            setSelectedSubjectTeachers(next)
                          }}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{t.user.firstName} {t.user.lastName}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSubjectTeachers.size > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{selectedSubjectTeachers.size} teacher(s) selected</p>
                  )}
                </div>
              )
            })()}

            <div className="p-4 border-t flex gap-3">
              <Button
                variant="primary"
                onClick={handleAssignSubject}
                loading={assigningSubject}
                disabled={!selectedSubject || assigningSubject}
                className="flex-1"
              >
                {subjects.some((s: any) => {
                  const eid = typeof s.subject === 'object' ? s.subject?._id : s.subject
                  return eid === selectedSubject
                }) ? 'Update Teachers' : 'Assign Subject'}
              </Button>
              <Button variant="outline" onClick={() => setSubjectModalOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Subject Confirmation */}
      <ConfirmDialog
        open={!!removeSubjectId}
        onClose={() => setRemoveSubjectId(null)}
        onConfirm={handleRemoveSubject}
        title="Remove Subject"
        message={`Remove this subject from ${cls.name}?`}
        loading={removingSubject}
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