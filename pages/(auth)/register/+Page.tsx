import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

    setLoading(true)

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        schoolName: formData.schoolName,
        phone: formData.phone || undefined,
      })

      toast.success('Account created successfully!')
      await navigate('/dashboard')
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-10 w-72 h-72 bg-blue-300/30 rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-200/25 rounded-full" />
        </div>

        <div className="relative z-10">
          <a href="/" className="text-3xl font-bold">Sqoolify</a>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Set up your school in minutes
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
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
                <span className="text-sm font-medium text-blue-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-200 text-sm">&copy; {new Date().getFullYear()} Sqoolify. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-lg">
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="text-3xl font-bold text-blue-600">Sqoolify</a>
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
              <a href="/login" className="text-blue-600 font-medium hover:text-blue-700">Sign in</a>
            </p>

            <p className="text-center text-xs text-gray-400 pt-2">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
