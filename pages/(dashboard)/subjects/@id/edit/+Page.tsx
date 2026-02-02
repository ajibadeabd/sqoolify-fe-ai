import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { subjectService, classService, teacherService } from '../../../../../lib/api-services'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import type { SchoolClass, Teacher } from '../../../../../lib/types'

export default function EditSubjectPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

  const [form, setForm] = useState({
    name: '',
    code: '',
    isCore: false,
    classId: '',
    teacherId: '',
    description: '',
    isActive: true,
  })
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [subjectRes, classesRes, teachersRes] = await Promise.all([
          subjectService.getById(id),
          classService.getAll({ limit: 100 }),
          teacherService.getAll({ limit: 100 }),
        ])
        const s = subjectRes.data
        setForm({
          name: s.name || '',
          code: s.code || '',
          isCore: s.isCore || false,
          classId: (typeof s.class === 'object' ? (s.class as any)?._id : s.class) || '',
          teacherId: (typeof s.teacher === 'object' ? (s.teacher as any)?._id : s.teacher) || '',
          description: s.description || '',
          isActive: s.isActive !== false,
        })
        setClasses(classesRes.data || [])
        setTeachers(teachersRes.data || [])
      } catch {
        toast.error('Failed to load subject')
        navigate('/subjects')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const update = (key: string, value: string | boolean) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await subjectService.update(id, {
        name: form.name,
        code: form.code,
        isCore: form.isCore,
        classId: form.classId || undefined,
        teacherId: form.teacherId || undefined,
        description: form.description || undefined,
        isActive: form.isActive,
      })
      toast.success('Subject updated successfully')
      await navigate('/subjects')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subject')
    } finally {
      setSaving(false)
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

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Subjects', href: '/subjects' }, { label: 'Edit Subject' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Subject</h1>

      <Card>
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
            <Button type="submit" loading={saving}>Update Subject</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/subjects')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
