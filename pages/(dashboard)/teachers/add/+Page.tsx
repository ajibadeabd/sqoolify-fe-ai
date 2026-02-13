import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { authService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'

export default function AddTeacherPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
      await authService.registerTeacher({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
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
      <h1 className="text-2xl font-bold text-gray-900">Create Teacher</h1>
      <p className="text-gray-500 mb-6">Fill in the details below to add a new teacher to the system.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Information</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={(e) => update('firstName', (e.target as HTMLInputElement).value)} required />
              <Input label="Last Name" value={form.lastName} onChange={(e) => update('lastName', (e.target as HTMLInputElement).value)} required />
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', (e.target as HTMLInputElement).value)}
              required
              helperText="Password will be auto-generated and sent via email"
            />

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

        <Card className="lg:col-span-1 sticky top-6 h-fit">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Name</p>
              <p className="font-medium text-gray-700 text-sm">
                {form.firstName || form.lastName
                  ? `${form.firstName} ${form.lastName}`.trim()
                  : 'Not set'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 mb-1">Qualification</p>
                <p className="font-medium text-purple-700 text-sm">{form.qualification || 'Not set'}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 mb-1">Level</p>
                <p className="font-medium text-green-700 text-sm">{form.level || 'Not set'}</p>
              </div>
            </div>

            {form.employeeId && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Employee ID</p>
                <p className="font-medium text-blue-700 text-sm">{form.employeeId}</p>
              </div>
            )}

            {form.primarySubject && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-600 mb-1">Primary Subject</p>
                <p className="font-medium text-orange-700 text-sm">{form.primarySubject}</p>
              </div>
            )}

            {form.experience && (
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 mb-1">Experience</p>
                <p className="font-medium text-indigo-700 text-sm">{form.experience}</p>
              </div>
            )}

            {form.employmentDate && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-600 mb-1">Employment Date</p>
                <p className="font-medium text-yellow-700 text-sm">{form.employmentDate}</p>
              </div>
            )}

            <div className="p-3 bg-sky-50 rounded-lg">
              <p className="text-xs text-sky-600 mb-1">Email</p>
              <p className="font-medium text-sky-700 text-sm">{form.email || 'Not set'}</p>
            </div>

            {form.address && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Address</p>
                <p className="font-medium text-gray-700 text-sm">{form.address}</p>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-lg mt-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">Tips</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>First name, last name, and email are required.</li>
                <li>A password will be auto-generated and emailed.</li>
                <li>Employee ID helps with internal identification.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
