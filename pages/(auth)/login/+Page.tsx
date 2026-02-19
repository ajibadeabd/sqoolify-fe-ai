import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'
import { useSchool } from '../../../lib/school-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { school } = useSchool()

  const schoolName = school?.name || 'Sqoolify'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login({ email, password })
      await navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

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
          <span className="text-3xl font-bold">{schoolName}</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Manage your entire school from one platform
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Students, teachers, exams, fees, attendance, report cards — everything in one place.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '👥', text: 'Student, Teacher & Parent portals' },
              { icon: '📝', text: 'CBT exams with auto-grading' },
              { icon: '💰', text: 'Fee management & online payments' },
              { icon: '📊', text: 'Report cards & analytics' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">&copy; {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-bold" style={{ color: 'var(--color-primary, #3B82F6)' }}>{schoolName}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                placeholder="you@school.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm" style={{ color: 'var(--color-primary, #3B82F6)' }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
                  placeholder="Enter your password"
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

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-sm text-gray-600">Remember me for 30 days</label>
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
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <a href={school ? 'https://sqoolify.com/register' : '/register'} className="font-medium" style={{ color: 'var(--color-primary, #3B82F6)' }}>Create your school</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
