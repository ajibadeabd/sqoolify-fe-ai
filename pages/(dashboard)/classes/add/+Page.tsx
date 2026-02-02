import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { classService, teacherService } from '../../../../lib/api-services'
import type { Teacher } from '../../../../lib/types'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'

export default function AddClassPage() {
  const [form, setForm] = useState({
    name: '',
    section: '',
    capacity: '',
    classTeacher: '',
  })
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    teacherService.getAll({ limit: 100 }).then((res) => setTeachers(res.data || []))
  }, [])

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await classService.create({
        name: form.name,
        section: form.section || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        classTeacherId: form.classTeacher || undefined,
      })

      await navigate('/classes')
    } catch (err: any) {
      setError(err.message || 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Classes', href: '/classes' }, { label: 'Add Class' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Class</h1>

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
            <Button type="submit" loading={loading}>Create Class</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/classes')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
