import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { subjectService, classService, teacherService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import type { SchoolClass, Teacher } from '../../../../lib/types'

export default function AddSubjectPage() {
  const [form, setForm] = useState({
    name: '',
    code: '',
    isCore: false,
    classId: '',
    teacherId: '',
    description: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          classService.getAll({ limit: 100 }),
          teacherService.getAll({ limit: 100 }),
        ])
        setClasses(classesRes.data || [])
        setTeachers(teachersRes.data || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
        toast.error('Failed to load classes and teachers')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  const update = (key: string, value: string | boolean) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await subjectService.create({
        name: form.name,
        code: form.code,
        isCore: form.isCore,
        classId: form.classId || undefined,
        teacherId: form.teacherId || undefined,
        description: form.description || undefined,
        isActive: form.isActive,
      })

      toast.success('Subject created successfully')
      await navigate('/subjects')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create subject')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Subjects', href: '/subjects' }, { label: 'Add Subject' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Subject</h1>

      <Card>
        {dataLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Subject Information</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Subject Name"
                value={form.name}
                onChange={(e) => update('name', (e.target as HTMLInputElement).value)}
                placeholder="e.g. Mathematics"
                required
              />
              <Input
                label="Subject Code"
                value={form.code}
                onChange={(e) => update('code', (e.target as HTMLInputElement).value)}
                placeholder="e.g. MATH101"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Brief description of the subject"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCore"
                  checked={form.isCore}
                  onChange={(e) => update('isCore', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="isCore" className="text-sm font-medium text-gray-700">
                  Core Subject
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => update('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Assign To (Optional)</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={form.classId}
                  onChange={(e) => update('classId', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={form.teacherId}
                  onChange={(e) => update('teacherId', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select teacher</option>
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading}>Create Subject</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/subjects')}>Cancel</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
