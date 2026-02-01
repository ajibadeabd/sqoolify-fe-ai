import { useState, useEffect, useMemo } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { authService, studentService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import type { Student } from '../../../../lib/types'

export default function AddParentPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    relationship: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentService.getAll({ limit: 1000 })
        setStudents(res.data || [])
      } catch (err) {
        console.error('Failed to fetch students:', err)
        toast.error('Failed to load students')
      } finally {
        setStudentsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students
    const query = studentSearch.toLowerCase()
    return students.filter((student) => {
      const user = typeof student.user === 'object' ? student.user : null
      if (!user) return false
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const email = user.email?.toLowerCase() || ''
      return fullName.includes(query) || email.includes(query) || student.admissionNo?.toLowerCase().includes(query)
    })
  }, [students, studentSearch])

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const toggleStudent = (studentId: string, hasParent: boolean) => {
    if (hasParent) return // Cannot select students with parents
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authService.registerParent({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        occupation: form.occupation || undefined,
        relationship: form.relationship || undefined,
        address: form.address || undefined,
        studentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
      })

      toast.success('Parent created successfully')
      await navigate('/parents')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create parent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Parents', href: '/parents' }, { label: 'Add Parent' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Parent</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => update('firstName', (e.target as HTMLInputElement).value)} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => update('lastName', (e.target as HTMLInputElement).value)} required />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', (e.target as HTMLInputElement).value)}
            required
            helperText="Password will be auto-generated and sent via email"
          />

          <Input label="Phone" value={form.phone} onChange={(e) => update('phone', (e.target as HTMLInputElement).value)} />

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Additional Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Occupation" value={form.occupation} onChange={(e) => update('occupation', (e.target as HTMLInputElement).value)} placeholder="e.g. Engineer, Teacher" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <select
                value={form.relationship}
                onChange={(e) => update('relationship', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select relationship</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <Input label="Address" value={form.address} onChange={(e) => update('address', (e.target as HTMLInputElement).value)} placeholder="Full address" />

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Link Children (Optional)</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Students
            </label>
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search by name, email, or admission number..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-2"
            />

            {studentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Loading students...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                {studentSearch ? 'No students match your search.' : 'No students available.'}
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {filteredStudents.map((student) => {
                  const user = typeof student.user === 'object' ? student.user : null
                  const studentName = user ? `${user.firstName} ${user.lastName}` : 'Unknown'
                  const hasParent = !!student.parent
                  const isSelected = selectedStudentIds.includes(student._id)

                  return (
                    <div
                      key={student._id}
                      onClick={() => toggleStudent(student._id, hasParent)}
                      className={`flex items-center px-3 py-2 border-b border-gray-100 last:border-b-0 ${
                        hasParent
                          ? 'opacity-50 cursor-not-allowed bg-gray-50'
                          : 'cursor-pointer hover:bg-blue-50'
                      } ${isSelected && !hasParent ? 'bg-blue-100' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={hasParent}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {studentName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {student.admissionNo || 'No ID'} • {user?.email || 'No email'}
                        </p>
                      </div>
                      {hasParent && (
                        <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          Has Parent
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {selectedStudentIds.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Create Parent</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/parents')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
