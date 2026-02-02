import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { classService, teacherService } from '../../../../../lib/api-services'
import type { Teacher } from '../../../../../lib/types'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function EditClassPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

  const [form, setForm] = useState({
    name: '',
    section: '',
    capacity: '',
    classTeacher: '',
  })
  const [teachers, setTeachers] = useState<Teacher[]>([])
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
        const teacherId = typeof cls.classTeacher === 'object' ? cls.classTeacher?._id : cls.classTeacher
        setForm({
          name: cls.name || '',
          section: cls.section || '',
          capacity: cls.capacity?.toString() || '',
          classTeacher: teacherId || '',
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Class</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <Input label="Class Name" value={form.name} onChange={(e) => update('name', (e.target as HTMLInputElement).value)} required placeholder="e.g. JSS 1, SS 2" />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Section" value={form.section} onChange={(e) => update('section', (e.target as HTMLInputElement).value)} placeholder="e.g. A, B, Science" />
            <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => update('capacity', (e.target as HTMLInputElement).value)} placeholder="e.g. 40" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
            <select
              value={form.classTeacher}
              onChange={(e) => update('classTeacher', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select class teacher</option>
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

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Update Class</Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/classes/${id}`)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
