import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'

export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()

  const userRole = user?.schools?.[0]?.roles?.[0] || 'User'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome back{user ? `, ${user.firstName}` : ''}
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition"
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {user ? user.firstName[0] + user.lastName[0] : '?'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <a
              href="/dashboard/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile
            </a>
            {userRole === 'admin' && (
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Settings
              </a>
            )}
            <hr className="my-1" />
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
