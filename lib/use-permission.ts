import { useAuth } from './auth-context';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canRead,
  canWrite,
  canDelete,
} from './permissions';

/**
 * Custom hook for checking user permissions in React components
 *
 * @example
 * ```tsx
 * import { usePermission } from '@/lib/use-permission';
 * import { PERMISSIONS } from '@/lib/permissions';
 *
 * function StudentsList() {
 *   const { can, canRead, canWrite, canDelete } = usePermission();
 *
 *   return (
 *     <div>
 *       {canRead('students') && <StudentsTable />}
 *       {canWrite('students') && <Button>Add Student</Button>}
 *       {canDelete('students') && <Button>Delete</Button>}
 *       {can(PERMISSIONS.GRADE_EXAMS) && <GradingSection />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermission() {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];

  return {
    /**
     * Check if user has a specific permission
     * @param permission - The permission string to check
     * @returns boolean
     *
     * @example
     * const { can } = usePermission();
     * if (can(PERMISSIONS.DELETE_STUDENTS)) {
     *   // Show delete button
     * }
     */
    can: (permission: string) => hasPermission(userPermissions, permission),

    /**
     * Check if user has ALL of the specified permissions (AND logic)
     * @param permissions - Array of permission strings
     * @returns boolean
     *
     * @example
     * const { canAll } = usePermission();
     * if (canAll([PERMISSIONS.READ_STUDENTS, PERMISSIONS.WRITE_STUDENTS])) {
     *   // Show advanced features
     * }
     */
    canAll: (permissions: string[]) => hasAllPermissions(userPermissions, permissions),

    /**
     * Check if user has ANY of the specified permissions (OR logic)
     * @param permissions - Array of permission strings
     * @returns boolean
     *
     * @example
     * const { canAny } = usePermission();
     * if (canAny([PERMISSIONS.READ_TEACHERS, PERMISSIONS.READ_PARENTS])) {
     *   // Show section if user can see either
     * }
     */
    canAny: (permissions: string[]) => hasAnyPermission(userPermissions, permissions),

    /**
     * Check if user can read a resource
     * @param resource - Resource name (e.g., 'students', 'teachers')
     * @returns boolean
     *
     * @example
     * const { canRead } = usePermission();
     * if (canRead('students')) {
     *   // Fetch and display students
     * }
     */
    canRead: (resource: string) => canRead(userPermissions, resource),

    /**
     * Check if user can write/modify a resource
     * @param resource - Resource name (e.g., 'students', 'teachers')
     * @returns boolean
     *
     * @example
     * const { canWrite } = usePermission();
     * {canWrite('students') && <EditStudentButton />}
     */
     canWrite: (resource: string) => canWrite(userPermissions, resource),

    /**
     * Check if user can delete a resource
     * @param resource - Resource name (e.g., 'students', 'teachers')
     * @returns boolean
     *
     * @example
     * const { canDelete } = usePermission();
     * {canDelete('students') && <DeleteStudentButton />}
     */
    canDelete: (resource: string) => canDelete(userPermissions, resource),

    /**
     * Get all user permissions (for debugging or advanced checks)
     */
    permissions: userPermissions,
  };
}
