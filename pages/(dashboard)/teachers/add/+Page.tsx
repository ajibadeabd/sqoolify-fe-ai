import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { api } from '../../../../lib/api'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'

export default function AddTeacherPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    qualification: '',
    level: '',
    aboutMe: '',
    employmentDate: '',
    experience: '',
    primarySubject: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/auth/register-teacher', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        employeeId: form.employeeId || undefined,
        qualification: form.qualification || undefined,
        level: form.level || undefined,
        aboutMe: form.aboutMe || undefined,
        employmentDate: form.employmentDate || undefined,
        experience: form.experience || undefined,
        primarySubject: form.primarySubject || undefined,
        address: form.address || undefined,
      })

      toast.success('Teacher created successfully')
      await navigate('/teachers')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create teacher')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Teachers', href: '/teachers' }, { label: 'Add Teacher' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Teacher</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => update('firstName', (e.target as HTMLInputElement).value)} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => update('lastName', (e.target as HTMLInputElement).value)} required />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', (e.target as HTMLInputElement).value)} required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', (e.target as HTMLInputElement).value)} required />
          </div>

          <Input label="Phone" value={form.phone} onChange={(e) => update('phone', (e.target as HTMLInputElement).value)} />

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Professional Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Employee ID" value={form.employeeId} onChange={(e) => update('employeeId', (e.target as HTMLInputElement).value)} placeholder="e.g. TCH001" />
            <Input label="Qualification" value={form.qualification} onChange={(e) => update('qualification', (e.target as HTMLInputElement).value)} placeholder="e.g. B.Ed, M.Sc" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Level" value={form.level} onChange={(e) => update('level', (e.target as HTMLInputElement).value)} placeholder="e.g. Senior, Junior" />
            <Input label="Primary Subject" value={form.primarySubject} onChange={(e) => update('primarySubject', (e.target as HTMLInputElement).value)} placeholder="e.g. Mathematics" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Employment Date" type="date" value={form.employmentDate} onChange={(e) => update('employmentDate', (e.target as HTMLInputElement).value)} />
            <Input label="Years of Experience" value={form.experience} onChange={(e) => update('experience', (e.target as HTMLInputElement).value)} placeholder="e.g. 5 years" />
          </div>

          <Input label="Address" value={form.address} onChange={(e) => update('address', (e.target as HTMLInputElement).value)} placeholder="Full address" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
            <textarea
              value={form.aboutMe}
              onChange={(e) => update('aboutMe', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Brief description about the teacher..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Create Teacher</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/teachers')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
