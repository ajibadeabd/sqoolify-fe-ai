# Frontend Permissions Usage Guide

## Overview

The frontend permission system allows you to conditionally render UI elements based on user permissions. This provides a better user experience by hiding features users cannot access.

**IMPORTANT**: Frontend permission checks are for UX only, not security. The backend ALWAYS enforces permissions on API endpoints.

## Files

- `lib/permissions.ts` - Permission constants and utility functions
- `lib/use-permission.ts` - React hook for permission checking in components
- `lib/types.ts` - User type includes `permissions: string[]`
- `lib/auth-context.tsx` - Auth context stores user with permissions

## Quick Start

### 1. Basic Permission Check in Component

```tsx
import { usePermission } from '@/lib/use-permission';
import { PERMISSIONS } from '@/lib/permissions';

function StudentsList() {
  const { can, canRead, canWrite, canDelete } = usePermission();

  return (
    <div>
      {/* Show list only if user can read students */}
      {canRead('students') && <StudentsTable />}

      {/* Show add button only if user can write students */}
      {canWrite('students') && (
        <button>Add Student</button>
      )}

      {/* Show delete button only if user can delete students */}
      {canDelete('students') && (
        <button>Delete Student</button>
      )}

      {/* Check specific permission */}
      {can(PERMISSIONS.GENERATE_REPORT_CARDS) && (
        <button>Generate Report Card</button>
      )}
    </div>
  );
}
```

### 2. Multiple Permission Checks

```tsx
import { usePermission } from '@/lib/use-permission';
import { PERMISSIONS } from '@/lib/permissions';

function ExamGrading() {
  const { canAll, canAny } = usePermission();

  // User must have ALL these permissions (AND logic)
  const canGradeAndWrite = canAll([
    PERMISSIONS.GRADE_EXAMS,
    PERMISSIONS.WRITE_EXAM_RESULTS,
  ]);

  // User must have at least ONE of these permissions (OR logic)
  const canAccessExams = canAny([
    PERMISSIONS.READ_EXAMS,
    PERMISSIONS.WRITE_EXAMS,
    PERMISSIONS.GRADE_EXAMS,
  ]);

  return (
    <div>
      {canAccessExams && <ExamsList />}
      {canGradeAndWrite && <GradingInterface />}
    </div>
  );
}
```

### 3. Disable Buttons Based on Permissions

```tsx
import { usePermission } from '@/lib/use-permission';
import { PERMISSIONS } from '@/lib/permissions';

function StudentActions({ studentId }: { studentId: string }) {
  const { canWrite, canDelete } = usePermission();

  return (
    <div className="flex gap-2">
      <button
        disabled={!canWrite('students')}
        className={!canWrite('students') ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Edit Student
      </button>

      <button
        disabled={!canDelete('students')}
        className={!canDelete('students') ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Delete Student
      </button>
    </div>
  );
}
```

### 4. Navigation Menu with Permissions

```tsx
import { usePermission } from '@/lib/use-permission';
import { PERMISSIONS } from '@/lib/permissions';

const navItems = [
  {
    label: 'Students',
    href: '/students',
    icon: 'users',
    permissions: [PERMISSIONS.READ_STUDENTS],
  },
  {
    label: 'Teachers',
    href: '/teachers',
    icon: 'briefcase',
    permissions: [PERMISSIONS.READ_TEACHERS],
  },
  {
    label: 'Enter Scores',
    href: '/enter-scores',
    icon: 'edit',
    permissions: [PERMISSIONS.GRADE_EXAMS],
  },
];

function Navigation() {
  const { canAny } = usePermission();

  const visibleItems = navItems.filter(item =>
    canAny(item.permissions)
  );

  return (
    <nav>
      {visibleItems.map(item => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
```

### 5. Conditional Form Fields

```tsx
import { usePermission } from '@/lib/use-permission';
import { PERMISSIONS } from '@/lib/permissions';

function StudentForm() {
  const { can } = usePermission();

  return (
    <form>
      <input name="firstName" placeholder="First Name" />
      <input name="lastName" placeholder="Last Name" />

      {/* Only admins can assign class */}
      {can(PERMISSIONS.WRITE_CLASSES) && (
        <select name="classId">
          <option>Select Class</option>
        </select>
      )}

      {/* Only users with parent permissions can assign parent */}
      {can(PERMISSIONS.WRITE_PARENTS) && (
        <select name="parentId">
          <option>Select Parent</option>
        </select>
      )}
    </form>
  );
}
```

## Available Functions

### `usePermission()` Hook

Returns an object with these functions:

#### `can(permission: string): boolean`
Check if user has a specific permission.

```tsx
const { can } = usePermission();
if (can(PERMISSIONS.DELETE_STUDENTS)) {
  // Show delete button
}
```

#### `canAll(permissions: string[]): boolean`
Check if user has ALL specified permissions (AND logic).

```tsx
const { canAll } = usePermission();
if (canAll([PERMISSIONS.READ_STUDENTS, PERMISSIONS.WRITE_STUDENTS])) {
  // Show advanced features
}
```

#### `canAny(permissions: string[]): boolean`
Check if user has ANY of the specified permissions (OR logic).

```tsx
const { canAny } = usePermission();
if (canAny([PERMISSIONS.READ_TEACHERS, PERMISSIONS.READ_PARENTS])) {
  // Show section if user can see either
}
```

#### `canRead(resource: string): boolean`
Check if user can read a resource (shorthand for `can('read_' + resource)`).

```tsx
const { canRead } = usePermission();
if (canRead('students')) {
  // Fetch students data
}
```

#### `canWrite(resource: string): boolean`
Check if user can write/modify a resource.

```tsx
const { canWrite } = usePermission();
{canWrite('students') && <EditButton />}
```

#### `canDelete(resource: string): boolean`
Check if user can delete a resource.

```tsx
const { canDelete } = usePermission();
{canDelete('students') && <DeleteButton />}
```

#### `permissions: string[]`
Get all user permissions (for debugging or advanced checks).

```tsx
const { permissions } = usePermission();
console.log('User permissions:', permissions);
```

## Permission Constants

All available permissions from `lib/permissions.ts`:

### Students
- `READ_STUDENTS` - View students list
- `WRITE_STUDENTS` - Create/edit students
- `DELETE_STUDENTS` - Delete students

### Teachers
- `READ_TEACHERS` - View teachers list
- `WRITE_TEACHERS` - Create/edit teachers
- `DELETE_TEACHERS` - Delete teachers

### Parents
- `READ_PARENTS` - View parents list
- `WRITE_PARENTS` - Create/edit parents
- `DELETE_PARENTS` - Delete parents

### Classes
- `READ_CLASSES` - View classes
- `WRITE_CLASSES` - Create/edit classes
- `DELETE_CLASSES` - Delete classes

### Subjects
- `READ_SUBJECTS` - View subjects
- `WRITE_SUBJECTS` - Create/edit subjects
- `DELETE_SUBJECTS` - Delete subjects

### Attendance
- `READ_ATTENDANCE` - View attendance records
- `WRITE_ATTENDANCE` - Mark attendance
- `DELETE_ATTENDANCE` - Delete attendance records

### Exams
- `READ_EXAMS` - View exams
- `WRITE_EXAMS` - Create/edit exams
- `DELETE_EXAMS` - Delete exams
- `GRADE_EXAMS` - Enter exam scores

### Exam Results
- `READ_EXAM_RESULTS` - View exam results
- `WRITE_EXAM_RESULTS` - Create/edit results
- `DELETE_EXAM_RESULTS` - Delete results

### Report Cards
- `READ_REPORT_CARDS` - View report cards
- `WRITE_REPORT_CARDS` - Edit report cards
- `GENERATE_REPORT_CARDS` - Generate new report cards

### Fees
- `READ_FEES` - View fee structure
- `WRITE_FEES` - Create/edit fees
- `DELETE_FEES` - Delete fees

### Payments
- `READ_PAYMENTS` - View payments
- `WRITE_PAYMENTS` - Record payments
- `DELETE_PAYMENTS` - Delete payments

### Sessions
- `READ_SESSIONS` - View sessions
- `WRITE_SESSIONS` - Create/edit sessions
- `DELETE_SESSIONS` - Delete sessions

### Notices
- `READ_NOTICES` - View notices
- `WRITE_NOTICES` - Create/edit notices
- `DELETE_NOTICES` - Delete notices

### Dashboard
- `VIEW_DASHBOARD` - Access dashboard
- `VIEW_ANALYTICS` - View analytics

### Schools
- `READ_SCHOOL_SETTINGS` - View school settings
- `WRITE_SCHOOL_SETTINGS` - Edit school settings

### Banks
- `READ_BANKS` - View bank accounts
- `WRITE_BANKS` - Create/edit bank accounts
- `DELETE_BANKS` - Delete bank accounts

### Subscriptions
- `READ_SUBSCRIPTIONS` - View subscriptions
- `MANAGE_SUBSCRIPTIONS` - Manage subscriptions

### Users
- `READ_USERS` - View users
- `WRITE_USERS` - Create/edit users
- `DELETE_USERS` - Delete users

### App Config
- `READ_APP_CONFIG` - View app configuration
- `WRITE_APP_CONFIG` - Edit app configuration

### File Storage
- `UPLOAD_FILES` - Upload files
- `DELETE_FILES` - Delete files

### Plans
- `READ_PLANS` - View subscription plans
- `WRITE_PLANS` - Create/edit plans
- `DELETE_PLANS` - Delete plans

## Best Practices

### 1. Always Check Permissions Before Showing Actions

❌ **Bad** - Show button to everyone:
```tsx
<button onClick={deleteStudent}>Delete</button>
```

✅ **Good** - Check permission first:
```tsx
{canDelete('students') && (
  <button onClick={deleteStudent}>Delete</button>
)}
```

### 2. Use Specific Permissions, Not Roles

❌ **Bad** - Hardcode role checks:
```tsx
{user?.role === 'admin' && <DeleteButton />}
```

✅ **Good** - Check permission:
```tsx
{canDelete('students') && <DeleteButton />}
```

### 3. Combine with Loading States

```tsx
function StudentsList() {
  const { canRead } = usePermission();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (canRead('students')) {
      fetchStudents().then(data => {
        setStudents(data);
        setLoading(false);
      });
    }
  }, [canRead]);

  if (!canRead('students')) {
    return <div>Access Denied</div>;
  }

  if (loading) return <LoadingSpinner />;

  return <StudentsTable data={students} />;
}
```

### 4. Show Helpful Messages

```tsx
function AdminPanel() {
  const { can } = usePermission();

  if (!can(PERMISSIONS.WRITE_SCHOOL_SETTINGS)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          You don't have permission to access admin settings.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return <AdminSettings />;
}
```

### 5. Defensive Coding

Always assume the user might not have permissions and handle gracefully:

```tsx
function StudentActions({ studentId }: { studentId: string }) {
  const { canWrite, canDelete } = usePermission();

  const handleEdit = () => {
    // Double-check permission (belt and suspenders)
    if (!canWrite('students')) {
      toast.error('You do not have permission to edit students');
      return;
    }
    // Proceed with edit
    editStudent(studentId);
  };

  return (
    <>
      {canWrite('students') && <button onClick={handleEdit}>Edit</button>}
      {canDelete('students') && <button>Delete</button>}
    </>
  );
}
```

## Troubleshooting

### Permissions always return false

**Problem**: `canRead('students')` always returns `false`.

**Solution**: Check if:
1. User is logged in: `const { user } = useAuth();`
2. Permissions in JWT: Decode token at jwt.io and check `permissions` array
3. Backend migration ran: `npm run migrate:permissions` in backend
4. Permission strings match exactly: 'read_students' not 'READ_STUDENTS'

### TypeScript errors

**Problem**: TypeScript complains about permission types.

**Solution**: Import from correct location:
```tsx
import { PERMISSIONS } from '@/lib/permissions';
// NOT: import { PERMISSIONS } from '../permissions';
```

### Permissions not updating after login

**Problem**: Old permissions cached.

**Solution**: Clear localStorage or logout/login again:
```tsx
localStorage.clear();
// Then login again
```

## Security Reminder

**Frontend permission checks are ONLY for UX.**

The backend MUST enforce all permissions using guards and decorators:

```typescript
// Backend controller
@Get()
@RequirePermissions(PERMISSIONS.READ_STUDENTS)
async findAll() {
  // This endpoint is protected
}
```

Never rely solely on frontend checks for security. Always validate permissions on the backend for every API call.
