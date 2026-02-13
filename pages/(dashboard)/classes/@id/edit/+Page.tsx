import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { classService, teacherService } from '../../../../../lib/api-services'
import { useAppConfig } from '../../../../../lib/use-app-config'
import type { Teacher } from '../../../../../lib/types'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function EditClassPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { classLevels, sectionPresets } = useAppConfig()

  const [form, setForm] = useState({
    name: '',
    section: '',
    capacity: '',
    classTeacher: '',
    level: '',
    room: '',
    description: '',
  })
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [classRes, teachersRes] = await Promise.all([
          classService.getById(id),
          teacherService.getAll({ limit: 100 }),
        ])
        const cls = classRes.data
        setTeachers(teachersRes.data || [])
        setStudentCount(cls.students?.length || 0)
        const teacherId = typeof cls.classTeacher === 'object' ? cls.classTeacher?._id : cls.classTeacher
        setForm({
          name: cls.name || '',
          section: cls.section || '',
          capacity: cls.capacity?.toString() || '',
          classTeacher: teacherId || '',
          level: cls.level || '',
          room: cls.room || '',
          description: cls.description || '',
        })
      } catch {
        toast.error('Failed to load class')
        navigate('/classes')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await classService.update(id, {
        name: form.name,
        section: form.section || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        level: form.level || undefined,
        room: form.room || undefined,
        description: form.description || undefined,
        classTeacherId: form.classTeacher || undefined,
      })
      toast.success('Class updated successfully')
      await navigate(`/classes/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update class')
    } finally {
      setSaving(false)
    }
  }

  const capacityNum = form.capacity ? Number(form.capacity) : 0
  const capacityColor = capacityNum > 50 ? 'text-red-600' : capacityNum > 30 ? 'text-yellow-600' : 'text-green-600'
  const selectedTeacher = teachers.find((t) => t._id === form.classTeacher)
  const teacherName = selectedTeacher && typeof selectedTeacher.user === 'object'
    ? `${selectedTeacher.user.firstName} ${selectedTeacher.user.lastName}`
    : null

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Classes', href: '/classes' }, { label: form.name, href: `/classes/${id}` }, { label: 'Edit' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
          <p className="text-sm text-gray-500 mt-1">Update class details and assignments</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Class Information</h3>

                <div className="space-y-4">
                  <Input
                    label="Class Name *"
                    value={form.name}
                    onChange={(e) => update('name', (e.target as HTMLInputElement).value)}
                    placeholder="e.g. JSS 1, SS 2, Primary 3"
                    required
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    {classLevels.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                        <select
                          value={form.level}
                          onChange={(e) => update('level', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        >
                          <option value="">Select level (optional)</option>
                          {classLevels.map((level) => (
                            <option key={level.shortCode} value={level.shortCode}>
                              {level.name} ({level.shortCode})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <input
                        type="text"
                        value={form.section}
                        readOnly
                        placeholder="Select from presets below"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-default outline-none"
                      />
                      {sectionPresets.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {sectionPresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => update('section', preset)}
                              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                                form.section === preset
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Capacity & Room</h3>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Student Capacity"
                        type="number"
                        value={form.capacity}
                        onChange={(e) => update('capacity', (e.target as HTMLInputElement).value)}
                        placeholder="e.g. 40"
                      />
                      {capacityNum > 0 && (
                        <p className={`text-xs mt-1 ${capacityColor}`}>
                          {capacityNum > 50 ? 'Large class size' : capacityNum > 30 ? 'Standard class size' : 'Small class size'}
                        </p>
                      )}
                    </div>
                    <Input
                      label="Classroom / Room No."
                      value={form.room}
                      onChange={(e) => update('room', (e.target as HTMLInputElement).value)}
                      placeholder="e.g. Room 101, Block A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder="Any additional notes about this class..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Class Teacher</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Class Teacher</label>
                  <select
                    value={form.classTeacher}
                    onChange={(e) => update('classTeacher', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="">No class teacher</option>
                    {teachers.map((teacher) => {
                      const user = typeof teacher.user === 'object' ? teacher.user : null
                      const name = user ? `${user.firstName} ${user.lastName}` : 'Unknown'
                      return (
                        <option key={teacher._id} value={teacher._id}>
                          {name}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" loading={saving} className="flex-1 sm:flex-none">
                  Update Class
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/classes/${id}`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Preview</h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Class Name</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-lg">{form.name || 'Not set'}</p>
                  {form.section && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{form.section}</span>
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
                    {form.level ? classLevels.find((l) => l.shortCode === form.level)?.name : 'Not set'}
                  </p>
                </div>
              </div>

              {teacherName && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Class Teacher</p>
                  <p className="font-medium text-blue-700 text-sm">{teacherName}</p>
                </div>
              )}

              {form.room && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Classroom</p>
                  <p className="font-medium text-orange-700 text-sm">{form.room}</p>
                </div>
              )}

              {form.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{form.description}</p>
                </div>
              )}

              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 mb-1">Current Students</p>
                <p className="font-medium text-indigo-700 text-sm">{studentCount} enrolled</p>
                {capacityNum > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-indigo-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${studentCount / capacityNum > 0.9 ? 'bg-red-500' : studentCount / capacityNum > 0.7 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((studentCount / capacityNum) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-indigo-500 mt-1">{Math.round((studentCount / capacityNum) * 100)}% capacity</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}