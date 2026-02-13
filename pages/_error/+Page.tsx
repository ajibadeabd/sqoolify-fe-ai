import { useState } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { useAuth } from '../../lib/auth-context'
import Sidebar from '../../components/layout/Sidebar'
import Topbar from '../../components/layout/Topbar'

function ErrorContent({ is404, isAuthenticated }: { is404: boolean; isAuthenticated: boolean }) {
  if (is404) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md px-6">
          <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href={isAuthenticated ? '/dashboard' : '/login'}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
            </a>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-md px-6">
        <div className="text-8xl font-bold text-red-200 mb-4">500</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-500 mb-8">
          An unexpected error occurred. Please try again later.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href={isAuthenticated ? '/dashboard' : '/login'}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  const { is404 } = usePageContext()
  const { isAuthenticated, isLoading } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Logged in: show error inside dashboard layout with sidebar/topbar
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <Topbar />
          <main className="p-6">
            <ErrorContent is404={!!is404} isAuthenticated={true} />
          </main>
        </div>
      </div>
    )
  }

  // Not logged in: show standalone error page
  return <ErrorContent is404={!!is404} isAuthenticated={false} />
}
