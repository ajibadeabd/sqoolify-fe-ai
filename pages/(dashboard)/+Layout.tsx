import { useState, useEffect, type ReactNode } from 'react'
import { navigate } from 'vike/client/router'
import { useAuth } from '../../lib/auth-context'
import { getRoutePermissions } from '../../lib/route-permissions'
import { hasAnyPermission } from '../../lib/permissions'
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
        const hasAccess = hasAnyPermission(userPermissions, requiredPermissions)

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: 'var(--color-primary, #3B82F6)' }}></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(var(--color-primary-rgb, 59,130,246), 0.12)' }} />
        <div className="absolute top-1/3 -left-16 w-72 h-72 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(var(--color-primary-rgb, 59,130,246), 0.1)' }} />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl" />
      </div>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={`relative z-1 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
