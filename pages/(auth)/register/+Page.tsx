import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'
import { buildSchoolUrl } from '../../../lib/subdomain'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4120/api/v1'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    phone: '',
    slug: '',
  })
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(10)
  const slugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { register } = useAuth()

  // Auto-generate slug from school name (unless user manually edited it)
  useEffect(() => {
    if (!slugTouched && formData.schoolName) {
      const autoSlug = formData.schoolName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug: autoSlug }))
    }
  }, [formData.schoolName, slugTouched])

  // Debounced slug availability check
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 2) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    if (slugTimerRef.current) clearTimeout(slugTimerRef.current)
    slugTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/check-slug/${formData.slug}`)
        const json = await res.json()
        setSlugStatus(json.data?.available ? 'available' : 'taken')
      } catch {
        setSlugStatus('idle')
      }
    }, 500)
    return () => { if (slugTimerRef.current) clearTimeout(slugTimerRef.current) }
  }, [formData.slug])

  useEffect(() => {
    if (!redirectUrl) return
    if (countdown <= 0) {
      window.location.href = redirectUrl
      return
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [redirectUrl, countdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true)
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
    setFormData({ ...formData, slug: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (slugStatus === 'taken') {
      toast.error('This school URL is already taken. Please choose a different one.')
      return
    }

    setLoading(true)

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        schoolName: formData.schoolName,
        phone: formData.phone || undefined,
        slug: formData.slug || undefined,
      })

      toast.success('Account created successfully!')
      const schoolUrl = buildSchoolUrl(formData.slug)
      setRedirectUrl(`${schoolUrl}/dashboard`)
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition'

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, var(--color-primary, #60A5FA), var(--color-secondary, #2563EB))' }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-10 w-72 h-72 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        </div>

        <div className="relative z-10">
          <a href="/" className="text-3xl font-bold">Sqoolify</a>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Set up your school in minutes
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Create your account, add your students and teachers, and start managing everything digitally.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { step: '1', text: 'Create your admin account' },
              { step: '2', text: 'Set up classes and subjects' },
              { step: '3', text: 'Import students via CSV or add manually' },
              { step: '4', text: 'Go live — teachers, parents & students join' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <span className="text-sm font-medium text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">&copy; {new Date().getFullYear()} Sqoolify. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-lg">
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="text-3xl font-bold" style={{ color: 'var(--color-primary, #3B82F6)' }}>Sqoolify</a>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your school account</h2>
            <p className="text-gray-500 mt-1">Get started for free — no credit card required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Info */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@school.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            {/* School Info */}
            <div className="space-y-4 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">School Information</p>
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  School Name
                </label>
                <input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  value={formData.schoolName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Bright Future Academy"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your School URL
                </label>
                <div className="flex items-center gap-0">
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    required
                    className="flex-1 px-4 py-3 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                    placeholder="bright-future-academy"
                  />
                  <span className="px-3 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-500 whitespace-nowrap">
                    .sqoolify.com
                  </span>
                </div>
                {formData.slug && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-xs text-gray-400">
                      Your school will be at <span className="font-medium" style={{ color: 'var(--color-primary, #3B82F6)' }}>{formData.slug}.sqoolify.com</span>
                    </p>
                    {slugStatus === 'checking' && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                        </svg>
                        Checking...
                      </span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Available
                      </span>
                    )}
                    {slugStatus === 'taken' && (
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Taken
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Set Password</p>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className={`${inputClass} pr-11`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`${inputClass} pr-11`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ backgroundColor: 'var(--color-primary, #3B82F6)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="font-medium" style={{ color: 'var(--color-primary, #3B82F6)' }}>Sign in</a>
            </p>

            <p className="text-center text-xs text-gray-400 pt-2">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
      {redirectUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(var(--color-primary-rgb, 59,130,246), 0.1)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--color-primary, #3B82F6)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Account Created Successfully!</h3>
            <p className="text-gray-600 text-sm mb-6">
              You will be redirected to your school website in
            </p>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke="var(--color-primary, #3B82F6)"
                  strokeWidth="2"
                  strokeDasharray={`${(countdown / 10) * 100.53} 100.53`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
                {countdown}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {formData.slug}.sqoolify.com
            </p>
            <button
              onClick={() => { window.location.href = redirectUrl }}
              className="text-white px-6 py-2.5 rounded-lg font-medium transition text-sm"
              style={{ backgroundColor: 'var(--color-primary, #3B82F6)' }}
            >
              Go Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
