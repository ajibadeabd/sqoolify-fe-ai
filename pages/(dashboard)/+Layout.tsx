import { useState, useEffect, type ReactNode } from 'react'
import { navigate } from 'vike/client/router'
import { useAuth } from '../../lib/auth-context'
import { getRoutePermissions } from '../../lib/route-permissions'
import { hasAllPermissions } from '../../lib/permissions'
import Sidebar from '../../components/layout/Sidebar'
import Topbar from '../../components/layout/Topbar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated])

  // Check route permissions
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const currentPath = window.location.pathname
      const requiredPermissions = getRoutePermissions(currentPath)

      // If route requires specific permissions, check them
      if (requiredPermissions && requiredPermissions.length > 0) {
        const userPermissions = user?.permissions || []
        const hasAccess = hasAllPermissions(userPermissions, requiredPermissions)

        if (!hasAccess) {
          // Redirect to dashboard if user lacks permissions
          navigate('/dashboard')
        }
      }
    }
  }, [isLoading, isAuthenticated, user, window.location.pathname])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
