/**
 * Frontend Permission Constants & Utilities
 *
 * IMPORTANT: These permission checks are for UX only (showing/hiding UI elements).
 * Security is ALWAYS enforced on the backend. Never trust frontend permission checks.
 */

// Permission constants - MUST match backend/src/common/constants/permissions.constants.ts
export const PERMISSIONS = {
  // Students
  READ_STUDENTS: 'read_students',
  WRITE_STUDENTS: 'write_students',
  DELETE_STUDENTS: 'delete_students',

  // Teachers
  READ_TEACHERS: 'read_teachers',
  WRITE_TEACHERS: 'write_teachers',
  DELETE_TEACHERS: 'delete_teachers',

  // Parents
  READ_PARENTS: 'read_parents',
  WRITE_PARENTS: 'write_parents',
  DELETE_PARENTS: 'delete_parents',

  // Classes
  READ_CLASSES: 'read_classes',
  WRITE_CLASSES: 'write_classes',
  DELETE_CLASSES: 'delete_classes',

  // Subjects
  READ_SUBJECTS: 'read_subjects',
  WRITE_SUBJECTS: 'write_subjects',
  DELETE_SUBJECTS: 'delete_subjects',

  // Attendance
  READ_ATTENDANCE: 'read_attendance',
  WRITE_ATTENDANCE: 'write_attendance',
  DELETE_ATTENDANCE: 'delete_attendance',

  // Exams
  READ_EXAMS: 'read_exams',
  WRITE_EXAMS: 'write_exams',
  DELETE_EXAMS: 'delete_exams',
  GRADE_EXAMS: 'grade_exams',

  // Exam Results
  READ_EXAM_RESULTS: 'read_exam_results',
  WRITE_EXAM_RESULTS: 'write_exam_results',
  DELETE_EXAM_RESULTS: 'delete_exam_results',

  // Report Cards
  READ_REPORT_CARDS: 'read_report_cards',
  WRITE_REPORT_CARDS: 'write_report_cards',
  GENERATE_REPORT_CARDS: 'generate_report_cards',

  // Fees
  READ_FEES: 'read_fees',
  WRITE_FEES: 'write_fees',
  DELETE_FEES: 'delete_fees',

  // Payments
  READ_PAYMENTS: 'read_payments',
  WRITE_PAYMENTS: 'write_payments',
  DELETE_PAYMENTS: 'delete_payments',

  // Sessions
  READ_SESSIONS: 'read_sessions',
  WRITE_SESSIONS: 'write_sessions',
  DELETE_SESSIONS: 'delete_sessions',

  // Notices
  READ_NOTICES: 'read_notices',
  WRITE_NOTICES: 'write_notices',
  DELETE_NOTICES: 'delete_notices',

  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',

  // Schools
  READ_SCHOOL_SETTINGS: 'read_school_settings',
  WRITE_SCHOOL_SETTINGS: 'write_school_settings',

  // Banks
  READ_BANKS: 'read_banks',
  WRITE_BANKS: 'write_banks',
  DELETE_BANKS: 'delete_banks',

  // Subscriptions
  READ_SUBSCRIPTIONS: 'read_subscriptions',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',

  // Users
  READ_USERS: 'read_users',
  WRITE_USERS: 'write_users',
  DELETE_USERS: 'delete_users',

  // App Config
  READ_APP_CONFIG: 'read_app_config',
  WRITE_APP_CONFIG: 'write_app_config',

  // File Storage
  UPLOAD_FILES: 'upload_files',
  DELETE_FILES: 'delete_files',

  // Plans (Platform Admin)
  READ_PLANS: 'read_plans',
  WRITE_PLANS: 'write_plans',
  DELETE_PLANS: 'delete_plans',

  // Parent Portal
  VIEW_CHILDREN: 'view_children',
  VIEW_CHILDREN_FEES: 'view_children_fees',
  MAKE_PAYMENTS: 'make_payments',
  VIEW_PAYMENT_HISTORY: 'view_payment_history',
  VIEW_CHILDREN_RESULTS: 'view_children_results',
  VIEW_CHILDREN_REPORT_CARDS: 'view_children_report_cards',
  VIEW_CHILDREN_ATTENDANCE: 'view_children_attendance',

  // Student Portal
  VIEW_MY_RESULTS: 'view_my_results',
  VIEW_MY_REPORT_CARD: 'view_my_report_card',
  VIEW_MY_ATTENDANCE: 'view_my_attendance',
  TAKE_EXAMS: 'take_exams',

  // Timetable
  READ_TIMETABLE: 'read_timetable',
  WRITE_TIMETABLE: 'write_timetable',
  DELETE_TIMETABLE: 'delete_timetable',
  VIEW_MY_TIMETABLE: 'view_my_timetable',

  // Chat
  ACCESS_CHAT: 'access_chat',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];


/**
 * Check if user has a specific permission
 * @param userPermissions - Array of permission strings from user object
 * @param requiredPermission - The permission to check for
 * @returns boolean
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermission: string
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has ALL of the specified permissions (AND logic)
 * @param userPermissions - Array of permission strings from user object
 * @param requiredPermissions - Array of permissions to check for
 * @returns boolean - true only if user has ALL permissions
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );
}

/**
 * Check if user has ANY of the specified permissions (OR logic)
 * @param userPermissions - Array of permission strings from user object
 * @param requiredPermissions - Array of permissions to check for
 * @returns boolean - true if user has at least one permission
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
}

/**
 * Check if user can perform read operations on a resource
 * @param userPermissions - Array of permission strings from user object
 * @param resource - Resource name (e.g., 'students', 'teachers')
 * @returns boolean
 */
export function canRead(
  userPermissions: string[] | undefined,
  resource: string
): boolean {
  return hasPermission(userPermissions, `read_${resource}`);
}

/**
 * Check if user can perform write operations on a resource
 * @param userPermissions - Array of permission strings from user object
 * @param resource - Resource name (e.g., 'students', 'teachers')
 * @returns boolean
 */
export function canWrite(
  userPermissions: string[] | undefined,
  resource: string
): boolean {
  return hasPermission(userPermissions, `write_${resource}`);
}

/**
 * Check if user can perform delete operations on a resource
 * @param userPermissions - Array of permission strings from user object
 * @param resource - Resource name (e.g., 'students', 'teachers')
 * @returns boolean
 */
export function canDelete(
  userPermissions: string[] | undefined,
  resource: string
): boolean {
  return hasPermission(userPermissions, `delete_${resource}`);
}
