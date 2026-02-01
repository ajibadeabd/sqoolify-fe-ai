import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { classService } from '../../../../../lib/api-services'
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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchClass = async () => {
      try {
        const res = await classService.getById(id)
        const cls = res.data
        setForm({
          name: cls.name || '',
          section: cls.section || '',
          capacity: cls.capacity?.toString() || '',
        })
      } catch {
        toast.error('Failed to load class')
        navigate('/classes')
      } finally {
        setLoading(false)
      }
    }
    fetchClass()
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

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Update Class</Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/classes/${id}`)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
