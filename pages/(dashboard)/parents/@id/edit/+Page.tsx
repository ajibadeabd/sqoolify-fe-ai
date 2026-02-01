import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { parentService } from '../../../../../lib/api-services'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function EditParentPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    relationship: '',
    address: '',
  })
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchParent = async () => {
      try {
        const res = await parentService.getById(id)
        const p = res.data
        const u = typeof p.user === 'object' ? p.user : null
        setForm({
          firstName: u?.firstName || '',
          lastName: u?.lastName || '',
          email: u?.email || '',
          phone: u?.phone || '',
          occupation: p.occupation || '',
          relationship: p.relationship || '',
          address: p.address || '',
        })
        setChildren(p.children || [])
      } catch {
        toast.error('Failed to load parent data')
        navigate('/parents')
      } finally {
        setLoading(false)
      }
    }
    fetchParent()
  }, [id])

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await parentService.update(id, {
        occupation: form.occupation?.trim() || undefined,
        relationship: form.relationship || undefined,
        address: form.address?.trim() || undefined,
      } as any)

      toast.success('Parent updated successfully')
      await navigate(`/parents/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update parent')
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

  const parentName = `${form.firstName} ${form.lastName}`.trim()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Parents', href: '/parents' },
          { label: parentName, href: `/parents/${id}` },
          { label: 'Edit' },
        ]}
      />

      <Card title="Edit Parent">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Account Information (read-only) */}
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Information</h3>
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-lg text-sm">
            Name, email, and phone belong to the user account and cannot be edited here.
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="firstName" label="First Name" value={form.firstName} disabled />
            <Input id="lastName" label="Last Name" value={form.lastName} disabled />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="email" label="Email" value={form.email} disabled />
            <Input id="phone" label="Phone" value={form.phone} disabled />
          </div>

          {/* Additional Information */}
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Additional Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              id="occupation"
              label="Occupation"
              value={form.occupation}
              onChange={(e) => update('occupation', (e.target as HTMLInputElement).value)}
              placeholder="e.g. Engineer, Teacher"
            />
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <select
                id="relationship"
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

          <Input
            id="address"
            label="Address"
            value={form.address}
            onChange={(e) => update('address', (e.target as HTMLInputElement).value)}
            placeholder="Full address"
          />

          {/* Children (read-only) */}
          {children.length > 0 && (
            <>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">
                Children ({children.length})
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                Children are managed from student profiles, not from the parent edit page.
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {children.map((child: any) => {
                  const childUser = typeof child.user === 'object' ? child.user : null
                  const childName = childUser ? `${childUser.firstName} ${childUser.lastName}` : 'Unknown'
                  return (
                    <div
                      key={child._id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => navigate(`/students/${child._id}`)}
                    >
                      <p className="font-medium text-gray-900">{childName}</p>
                      <p className="text-xs text-gray-500">
                        {child.admissionNo || 'No ID'} &bull; {child.class?.name || 'No class'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving} disabled={saving}>Update Parent</Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/parents/${id}`)} disabled={saving}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
