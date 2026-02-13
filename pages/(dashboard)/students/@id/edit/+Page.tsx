import { useState, useEffect, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { studentService, classService, parentService } from '../../../../../lib/api-services'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import type { SchoolClass, Parent } from '../../../../../lib/types'
import { useAppConfig } from '../../../../../lib/use-app-config'

interface StudentForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  bloodGroup: string
  admissionDate: string
  status: string
  classId: string
  parentId: string
  language: string
  aboutMe: string
  hobbies: string
  photo: string
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function EditStudentPage() {
  const { studentStatuses } = useAppConfig()
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

  const [form, setForm] = useState<StudentForm>({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', address: '', bloodGroup: '',
    admissionDate: '', status: 'active', classId: '', parentId: '',
    language: '', aboutMe: '', hobbies: '', photo: '',
  })
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [studentRes, classesRes, parentsRes] = await Promise.all([
          studentService.getById(id),
          classService.getAll(),
          parentService.getAll(),
        ])
        const s = studentRes.data
        const u = typeof s.user === 'object' ? s.user : null
        setForm({
          firstName: u?.firstName || '',
          lastName: u?.lastName || '',
          email: u?.email || '',
          phone: u?.phone || '',
          dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
          gender: s.gender || '',
          address: s.address || '',
          bloodGroup: s.bloodGroup || '',
          admissionDate: s.admissionDate ? s.admissionDate.split('T')[0] : '',
          status: s.status || 'active',
          classId: (typeof s.class === 'object' ? (s.class as any)?._id : s.class) || '',
          parentId: (typeof s.parent === 'object' ? (s.parent as any)?._id : s.parent) || '',
          language: s.language || '',
          aboutMe: s.aboutMe || '',
          hobbies: s.hobbies?.join(', ') || '',
          photo: s.photo || '',
        })
        setClasses(classesRes.data || [])
        setParents(parentsRes.data || [])
      } catch {
        toast.error('Failed to load student data')
        navigate('/students')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const update = useCallback(<K extends keyof StudentForm>(key: K, value: StudentForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }, [errors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const hobbiesArray = form.hobbies
        ? form.hobbies.split(',').map((h) => h.trim()).filter(Boolean)
        : undefined

      await studentService.update(id, {
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        address: form.address?.trim() || undefined,
        bloodGroup: form.bloodGroup || undefined,
        admissionDate: form.admissionDate || undefined,
        status: form.status || undefined,
        class: form.classId || undefined,
        parent: form.parentId || undefined,
        language: form.language?.trim() || undefined,
        aboutMe: form.aboutMe?.trim() || undefined,
        hobbies: hobbiesArray,
        photo: form.photo?.trim() || undefined,
      } as any)

      toast.success('Student updated successfully')
      await navigate(`/students/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student')
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

  const studentName = `${form.firstName} ${form.lastName}`.trim()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Students', href: '/students' },
          { label: studentName, href: `/students/${id}` },
          { label: 'Edit' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
        <p className="text-sm text-gray-500 mt-1">Update student details and assignments</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <Card>
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

              {/* Personal Information */}
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Personal Information</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  id="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    id="bloodGroup"
                    value={form.bloodGroup}
                    onChange={(e) => update('bloodGroup', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <Input
                  id="language"
                  label="Language"
                  value={form.language}
                  onChange={(e) => update('language', e.target.value)}
                  placeholder="e.g. English, Yoruba"
                />
              </div>

              <Input
                id="address"
                label="Address"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Full address"
              />

              <Input
                id="photo"
                label="Photo URL"
                type="url"
                value={form.photo}
                onChange={(e) => update('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />

              <div>
                <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                <textarea
                  id="aboutMe"
                  value={form.aboutMe}
                  onChange={(e) => update('aboutMe', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows={3}
                  placeholder="Brief description about the student..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{form.aboutMe.length}/500 characters</p>
              </div>

              <Input
                id="hobbies"
                label="Hobbies"
                value={form.hobbies}
                onChange={(e) => update('hobbies', e.target.value)}
                placeholder="Comma separated: Football, Reading, Music"
              />

              {/* Academic Information */}
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Academic Information</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  id="admissionDate"
                  label="Admission Date"
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) => update('admissionDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => update('status', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {studentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    id="classId"
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
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
                  <select
                    id="parentId"
                    value={form.parentId}
                    onChange={(e) => update('parentId', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select parent</option>
                    {parents.map((p) => {
                      const u = typeof p.user === 'object' ? p.user : null
                      const name = u ? `${u.firstName} ${u.lastName}` : 'Unknown'
                      return (
                        <option key={p._id} value={p._id}>{name}</option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={saving} disabled={saving}>Update Student</Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/students/${id}`)} disabled={saving}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Live Preview</h3>
              <div className="space-y-3">
                {/* Name */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium text-gray-700 text-sm">{`${form.firstName} ${form.lastName}`.trim() || 'Not set'}</p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    form.status === 'active' ? 'bg-green-50 text-green-700' :
                    form.status === 'inactive' ? 'bg-gray-50 text-gray-600' :
                    form.status === 'graduated' ? 'bg-blue-50 text-blue-700' :
                    form.status === 'transferred' ? 'bg-yellow-50 text-yellow-700' :
                    form.status === 'suspended' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {form.status ? form.status.charAt(0).toUpperCase() + form.status.slice(1) : 'Unknown'}
                  </span>
                </div>

                {/* Gender & Blood Group */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${form.gender === 'male' ? 'bg-sky-50' : form.gender === 'female' ? 'bg-pink-50' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-1 ${form.gender === 'male' ? 'text-sky-600' : form.gender === 'female' ? 'text-pink-600' : 'text-gray-500'}`}>Gender</p>
                    <p className={`font-medium text-sm ${form.gender === 'male' ? 'text-sky-700' : form.gender === 'female' ? 'text-pink-700' : 'text-gray-700'}`}>
                      {form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : 'Not set'}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600 mb-1">Blood Group</p>
                    <p className="font-medium text-red-700 text-sm">{form.bloodGroup || 'Not set'}</p>
                  </div>
                </div>

                {/* Class */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Class</p>
                  <p className="font-medium text-blue-700 text-sm">
                    {(() => {
                      const cls = classes.find(c => c._id === form.classId)
                      return cls ? `${cls.name}${cls.section ? ` - ${cls.section}` : ''}` : 'Not set'
                    })()}
                  </p>
                </div>

                {/* Email */}
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">Email</p>
                  <p className="font-medium text-purple-700 text-sm">{form.email || 'Not set'}</p>
                </div>

                {/* Date of Birth */}
                {form.dateOfBirth && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-600 mb-1">Date of Birth</p>
                    <p className="font-medium text-orange-700 text-sm">{form.dateOfBirth}</p>
                  </div>
                )}

                {/* Language */}
                {form.language && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-600 mb-1">Language</p>
                    <p className="font-medium text-indigo-700 text-sm">{form.language}</p>
                  </div>
                )}

                {/* Address */}
                {form.address && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="font-medium text-gray-700 text-sm">{form.address}</p>
                  </div>
                )}

                {/* Hobbies */}
                {form.hobbies && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Hobbies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.hobbies.split(',').map((h) => h.trim()).filter(Boolean).map((hobby, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {hobby}
                        </span>
                      ))}
                    </div>
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
