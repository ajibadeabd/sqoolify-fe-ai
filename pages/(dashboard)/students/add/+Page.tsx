import { useState, useEffect, useCallback } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { api, authOptions } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import type { SchoolClass, Parent, ApiResponse } from '../../../../lib/types'

interface StudentForm {
  firstName: string
  lastName: string
  email: string
  password: string
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

interface FormErrors {
  [key: string]: string
}

const INITIAL_FORM: StudentForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  bloodGroup: '',
  admissionDate: '',
  status: 'active',
  classId: '',
  parentId: '',
  language: '',
  aboutMe: '',
  hobbies: '',
  photo: '',
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const STATUSES = ['active', 'inactive', 'graduated', 'transferred', 'suspended']

export default function AddStudentPage() {
  const [form, setForm] = useState<StudentForm>(INITIAL_FORM)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, parentsRes] = await Promise.all([
          api.get<ApiResponse<SchoolClass[]>>('/classes', authOptions()),
          api.get<ApiResponse<Parent[]>>('/parents', authOptions()),
        ])
        setClasses(classesRes.data || [])
        setParents(parentsRes.data || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
        toast.error('Failed to load classes and parents. Please refresh.')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const update = useCallback(<K extends keyof StudentForm>(key: K, value: StudentForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
    // Clear field error on change
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }, [errors])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    
    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and number'
    }

    // Phone validation (optional but if provided, must be valid)
    if (form.phone && !/^[\d\s+()-]{10,}$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    // Date of birth validation
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      if (age < 3 || age > 25) {
        newErrors.dateOfBirth = 'Student age must be between 3 and 25'
      }
    }

    // Photo URL validation
    if (form.photo && !/^https?:\/\/.+\..+/.test(form.photo)) {
      newErrors.photo = 'Invalid photo URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors')
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0]
      document.getElementById(firstErrorField)?.focus()
      return
    }

    setLoading(true)

    try {
      const hobbiesArray = form.hobbies
        ? form.hobbies.split(',').map((h) => h.trim()).filter(Boolean)
        : undefined

      await api.post(
        '/auth/register-student',
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          address: form.address?.trim() || undefined,
          bloodGroup: form.bloodGroup || undefined,
          admissionDate: form.admissionDate || undefined,
          status: form.status || undefined,
          classId: form.classId || undefined,
          parentId: form.parentId || undefined,
          language: form.language?.trim() || undefined,
          aboutMe: form.aboutMe?.trim() || undefined,
          hobbies: hobbiesArray,
          photo: form.photo?.trim() || undefined,
        },
        authOptions()
      )

      toast.success('Student created successfully')
      setIsDirty(false)
      await navigate('/students')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create student'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmed) return
    }
    await navigate('/students')
  }

  const getFieldError = (field: string) => errors[field]

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Students', href: '/students' },
          { label: 'Add Student' },
        ]}
      />

      <Card title="Add Student">
        {dataLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Account Information */}
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Account Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First Name"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                error={getFieldError('firstName')}
                required
                autoComplete="given-name"
              />
              <Input
                id="lastName"
                label="Last Name"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                error={getFieldError('lastName')}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={getFieldError('email')}
                required
                autoComplete="email"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                error={getFieldError('password')}
                required
                autoComplete="new-password"
                helperText="Min 8 chars with uppercase, lowercase, and number"
              />
            </div>

            <Input
              id="phone"
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              error={getFieldError('phone')}
              autoComplete="tel"
            />

            {/* Personal Information */}
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">
              Personal Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                error={getFieldError('dateOfBirth')}
                max={new Date().toISOString().split('T')[0]}
              />

              <div>
                <label 
                  htmlFor="gender" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gender
                </label>
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
                <label 
                  htmlFor="bloodGroup" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Blood Group
                </label>
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
              error={getFieldError('photo')}
              placeholder="https://example.com/photo.jpg"
            />

            <div>
              <label 
                htmlFor="aboutMe" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                About Me
              </label>
              <textarea
                id="aboutMe"
                value={form.aboutMe}
                onChange={(e) => update('aboutMe', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={3}
                placeholder="Brief description about the student..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.aboutMe.length}/500 characters
              </p>
            </div>

            <Input
              id="hobbies"
              label="Hobbies"
              value={form.hobbies}
              onChange={(e) => update('hobbies', e.target.value)}
              placeholder="Comma separated: Football, Reading, Music"
            />

            {/* Academic Information */}
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">
              Academic Information
            </h3>

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
                <label 
                  htmlFor="status" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="classId" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Class
                </label>
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
                {classes.length === 0 && !dataLoading && (
                  <p className="text-xs text-amber-600 mt-1">
                    No classes available. Create a class first.
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="parentId" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Parent
                </label>
                <select
                  id="parentId"
                  value={form.parentId}
                  onChange={(e) => update('parentId', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select parent</option>
                  {parents.map((parent) => {
                    const user = typeof parent.user === 'object' ? parent.user : null
                    const name = user
                      ? `${user.firstName} ${user.lastName}`
                      : 'Unknown'
                    return (
                      <option key={parent._id} value={parent._id}>
                        {name}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} disabled={loading}>
                Create Student
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}