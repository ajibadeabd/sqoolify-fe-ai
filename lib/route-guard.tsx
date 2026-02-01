import { useEffect } from 'react';
import { navigate } from 'vike/client/router';
import { useAuth } from './auth-context';
import { hasPermission, hasAnyPermission } from './permissions';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAny?: boolean; // If true, user needs ANY of the permissions. If false, needs ALL
  redirectTo?: string;
}

/**
 * Route guard component that protects pages based on user permissions
 *
 * @example
 * ```tsx
 * import { RouteGuard } from '@/lib/route-guard';
 * import { PERMISSIONS } from '@/lib/permissions';
 *
 * export default function SubscriptionsPage() {
 *   return (
 *     <RouteGuard requiredPermissions={[PERMISSIONS.MANAGE_SUBSCRIPTIONS]}>
 *       <div>Subscriptions content...</div>
 *     </RouteGuard>
 *   );
 * }
 * ```
 */
export function RouteGuard({
  children,
  requiredPermissions = [],
  requireAny = false,
  redirectTo = '/dashboard'
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If no permissions required, allow access
    if (requiredPermissions.length === 0) return;

    const userPermissions = user?.permissions || [];

    // Check permissions
    let hasAccess = false;

    if (requireAny) {
      // User needs ANY of the required permissions
      hasAccess = hasAnyPermission(userPermissions, requiredPermissions);
    } else {
      // User needs ALL of the required permissions
      hasAccess = requiredPermissions.every(permission =>
        hasPermission(userPermissions, permission)
      );
    }

    if (!hasAccess) {
      // Redirect to dashboard with error message
      navigate(redirectTo);
    }
  }, [isLoading, isAuthenticated, user, requiredPermissions, requireAny, redirectTo]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated or no permissions
  if (!isAuthenticated) return null;

  if (requiredPermissions.length > 0) {
    const userPermissions = user?.permissions || [];
    let hasAccess = false;

    if (requireAny) {
      hasAccess = hasAnyPermission(userPermissions, requiredPermissions);
    } else {
      hasAccess = requiredPermissions.every(permission =>
        hasPermission(userPermissions, permission)
      );
    }

    if (!hasAccess) return null;
  }

  return <>{children}</>;
}
