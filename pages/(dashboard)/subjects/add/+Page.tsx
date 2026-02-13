import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { subjectService, teacherService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import type { Teacher } from '../../../../lib/types'

export default function AddSubjectPage() {
  const [form, setForm] = useState({
    name: '',
    code: '',
    isCore: false,
    teacherIds: [] as string[],
    description: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersRes = await teacherService.getAll({ limit: 100 })
        setTeachers(teachersRes.data || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
        toast.error('Failed to load teachers')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  const update = (key: string, value: string | boolean | string[]) => setForm({ ...form, [key]: value })

  const toggleArrayItem = (key: 'teacherIds', id: string) => {
    const current = form[key]
    if (current.includes(id)) {
      update(key, current.filter((v) => v !== id))
    } else {
      update(key, [...current, id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await subjectService.create({
        name: form.name,
        code: form.code,
        isCore: form.isCore,
        teacherIds: form.teacherIds.length ? form.teacherIds : undefined,
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
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Add Subject</h1>

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

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Assign Teachers (Optional)</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teachers</label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {teachers.length === 0 ? (
                  <p className="text-sm text-gray-400">No teachers available</p>
                ) : (
                  teachers.map((teacher) => {
                    const user = typeof teacher.user === 'object' ? teacher.user : null
                    const name = user ? `${user.firstName} ${user.lastName}` : 'Unknown'
                    return (
                      <label key={teacher._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.teacherIds.includes(teacher._id)}
                          onChange={() => toggleArrayItem('teacherIds', teacher._id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{name}</span>
                      </label>
                    )
                  })
                )}
              </div>
              {form.teacherIds.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{form.teacherIds.length} teacher(s) selected</p>
              )}
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
