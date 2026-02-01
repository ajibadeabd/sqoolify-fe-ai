import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { classService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'

export default function AddClassPage() {
  const [form, setForm] = useState({
    name: '',
    section: '',
    capacity: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Create Class</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/classes')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
