import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { teacherService } from '../../../../../lib/api-services'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function EditTeacherPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchTeacher = async () => {
      try {
        const res = await teacherService.getById(id)
        const t = res.data
        const u = typeof t.user === 'object' ? t.user : null
        setForm({
          firstName: u?.firstName || '',
          lastName: u?.lastName || '',
          email: u?.email || '',
          phone: u?.phone || '',
          employeeId: t.employeeId || '',
          qualification: t.qualification || '',
          level: t.level || '',
          aboutMe: t.aboutMe || '',
          employmentDate: t.employmentDate ? t.employmentDate.split('T')[0] : '',
          experience: t.experience || '',
          primarySubject: t.primarySubject || '',
          address: t.address || '',
        })
      } catch {
        toast.error('Failed to load teacher data')
        navigate('/teachers')
      } finally {
        setLoading(false)
      }
    }
    fetchTeacher()
  }, [id])

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await teacherService.update(id, {
        qualification: form.qualification?.trim() || undefined,
        level: form.level?.trim() || undefined,
        aboutMe: form.aboutMe?.trim() || undefined,
        employmentDate: form.employmentDate || undefined,
        experience: form.experience?.trim() || undefined,
        primarySubject: form.primarySubject?.trim() || undefined,
        address: form.address?.trim() || undefined,
      } as any)

      toast.success('Teacher updated successfully')
      await navigate(`/teachers/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update teacher')
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

  const teacherName = `${form.firstName} ${form.lastName}`.trim()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Teachers', href: '/teachers' },
          { label: teacherName, href: `/teachers/${id}` },
          { label: 'Edit' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Teacher</h1>
        <p className="text-gray-500 mt-1">Update teacher details</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card title="Teacher Information" className="lg:col-span-2">
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

            {/* Professional Information */}
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Professional Information</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="employeeId"
                label="Employee ID"
                value={form.employeeId}
                disabled
              />
              <Input
                id="qualification"
                label="Qualification"
                value={form.qualification}
                onChange={(e) => update('qualification', (e.target as HTMLInputElement).value)}
                placeholder="e.g. B.Ed, M.Sc"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="level"
                label="Level"
                value={form.level}
                onChange={(e) => update('level', (e.target as HTMLInputElement).value)}
                placeholder="e.g. Senior, Junior"
              />
              <Input
                id="primarySubject"
                label="Primary Subject"
                value={form.primarySubject}
                onChange={(e) => update('primarySubject', (e.target as HTMLInputElement).value)}
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="employmentDate"
                label="Employment Date"
                type="date"
                value={form.employmentDate}
                onChange={(e) => update('employmentDate', (e.target as HTMLInputElement).value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <Input
                id="experience"
                label="Years of Experience"
                value={form.experience}
                onChange={(e) => update('experience', (e.target as HTMLInputElement).value)}
                placeholder="e.g. 5 years"
              />
            </div>

            <Input
              id="address"
              label="Address"
              value={form.address}
              onChange={(e) => update('address', (e.target as HTMLInputElement).value)}
              placeholder="Full address"
            />

            <div>
              <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
              <textarea
                id="aboutMe"
                value={form.aboutMe}
                onChange={(e) => update('aboutMe', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Brief description about the teacher..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{form.aboutMe.length}/500 characters</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={saving} disabled={saving}>Update Teacher</Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/teachers/${id}`)} disabled={saving}>Cancel</Button>
            </div>
          </form>
        </Card>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card title="Live Preview">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-700 text-sm">{form.firstName} {form.lastName}</p>
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

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Employee ID</p>
                  <p className="font-medium text-blue-700 text-sm">{form.employeeId || 'Not set'}</p>
                </div>

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

                {form.aboutMe && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">About</p>
                    <p className="font-medium text-gray-700 text-sm line-clamp-3">{form.aboutMe}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
