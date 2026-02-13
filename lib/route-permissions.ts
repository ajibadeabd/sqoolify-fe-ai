import { PERMISSIONS } from './permissions';

/**
 * Centralized route-to-permission mapping
 * Add or update routes here - this is the SINGLE source of truth
 */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Students
  '/students': [PERMISSIONS.READ_STUDENTS],
  '/students/add': [PERMISSIONS.WRITE_STUDENTS],

  // Teachers
  '/teachers': [PERMISSIONS.READ_TEACHERS],
  '/teachers/add': [PERMISSIONS.WRITE_TEACHERS],

  // Parents
  '/parents': [PERMISSIONS.READ_PARENTS],
  '/parents/add': [PERMISSIONS.WRITE_PARENTS],

  // Classes
  '/classes': [PERMISSIONS.READ_CLASSES],
  '/classes/add': [PERMISSIONS.WRITE_CLASSES],

  // Subjects
  '/subjects': [PERMISSIONS.READ_SUBJECTS],
  '/subjects/add': [PERMISSIONS.WRITE_SUBJECTS],

  // Attendance
  '/attendance': [PERMISSIONS.READ_ATTENDANCE],

  // Exams
  '/exams': [PERMISSIONS.READ_EXAMS],
  '/exams/add': [PERMISSIONS.WRITE_EXAMS],

  // Report Cards
  '/report-cards': [PERMISSIONS.READ_REPORT_CARDS],

  // Fees
  '/fees': [PERMISSIONS.READ_FEES],
  '/fees/add': [PERMISSIONS.WRITE_FEES],

  // Payments
  '/payments': [PERMISSIONS.READ_PAYMENTS],
  '/payments/add': [PERMISSIONS.WRITE_PAYMENTS],

  // Sessions
  '/sessions': [PERMISSIONS.READ_SESSIONS],
  '/sessions/add': [PERMISSIONS.WRITE_SESSIONS],

  // Notices
  '/notices': [PERMISSIONS.READ_NOTICES],
  '/notices/add': [PERMISSIONS.WRITE_NOTICES],

  // Settings
  '/settings': [PERMISSIONS.READ_SCHOOL_SETTINGS],

  // Banks
  '/banks': [PERMISSIONS.READ_BANKS],

  // Subscriptions
  '/subscriptions': [PERMISSIONS.READ_SUBSCRIPTIONS],

  // Dashboard - everyone with VIEW_DASHBOARD can access
  '/dashboard': [PERMISSIONS.VIEW_DASHBOARD],

  // Parent Portal
  '/my-children': [PERMISSIONS.VIEW_CHILDREN],
  '/my-children/:id': [PERMISSIONS.VIEW_CHILDREN],
  '/my-children/:id/fees': [PERMISSIONS.VIEW_CHILDREN_FEES],
  '/my-children/:id/attendance': [PERMISSIONS.VIEW_CHILDREN_ATTENDANCE],
  '/my-children/:id/report-card': [PERMISSIONS.VIEW_CHILDREN_REPORT_CARDS],
  '/my-fees': [PERMISSIONS.VIEW_CHILDREN_FEES, PERMISSIONS.VIEW_MY_RESULTS],

  // Student Portal
  '/my-results': [PERMISSIONS.VIEW_MY_RESULTS],
  '/my-report-card': [PERMISSIONS.VIEW_MY_REPORT_CARD],
  '/my-exams': [PERMISSIONS.TAKE_EXAMS],
  '/my-attendance': [PERMISSIONS.VIEW_MY_ATTENDANCE],

  // Chat
  '/chat-rooms': [PERMISSIONS.ACCESS_CHAT],
};

/**
 * Get required permissions for a route
 * Supports exact matches and pattern matching for dynamic routes
 */
export function getRoutePermissions(path: string): string[] | undefined {
  // Exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }

  // Pattern matching for dynamic routes like /students/123
  for (const [routePattern, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    // Convert route pattern to regex (e.g., /students/:id becomes /students/[^/]+)
    const regex = new RegExp(`^${routePattern.replace(/:\w+/g, '[^/]+')}$`);
    if (regex.test(path)) {
      return permissions;
    }
  }

  return undefined;
}
