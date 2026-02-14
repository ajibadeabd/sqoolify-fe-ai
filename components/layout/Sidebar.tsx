import { usePageContext } from 'vike-react/usePageContext';
import { useAuth } from '../../lib/auth-context';
import { usePermission } from '../../lib/use-permission';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
  permissions?: string[]; // Array of required permissions (user needs at least one)
  section?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Students', href: '/students', icon: 'users', permissions: ['read_students'] },
      { label: 'Teachers', href: '/teachers', icon: 'briefcase', permissions: ['read_teachers'] },
      { label: 'Parents', href: '/parents', icon: 'heart', permissions: ['read_parents'] },
    ],
  },
  {
    title: 'Academics',
    items: [
      { label: 'Classes', href: '/classes', icon: 'book-open', permissions: ['read_classes'] },
      { label: 'Subjects', href: '/subjects', icon: 'file-text', permissions: ['read_subjects'] },
      { label: 'Sessions', href: '/sessions', icon: 'calendar', permissions: ['read_sessions'] },
      { label: 'Exams', href: '/exams', icon: 'clipboard', permissions: ['read_exams'] },
      { label: 'Report Cards', href: '/report-cards', icon: 'award', permissions: ['read_report_cards'] },
      { label: 'Attendance', href: '/attendance', icon: 'check-circle', permissions: ['read_attendance'] },
      { label: 'Timetable', href: '/timetable', icon: 'calendar', permissions: ['read_timetable'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Fees', href: '/fees', icon: 'dollar', permissions: ['read_fees'] },
      { label: 'Payments', href: '/payments', icon: 'credit-card', permissions: ['read_payments'] },
      { label: 'Banks', href: '/banks', icon: 'bank', permissions: ['read_banks'] },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Notices', href: '/notices', icon: 'bell', permissions: ['read_notices'] },
      { label: 'Chat Rooms', href: '/chat-rooms', icon: 'message-circle', permissions: ['access_chat'] },
    ],
  },
  {
    title: 'Teacher Portal',
    items: [
      { label: 'My Classes', href: '/my-classes', icon: 'book-open', roles: ['teacher'] },
      { label: 'My Subjects', href: '/my-subjects', icon: 'file-text', roles: ['teacher'] },
      { label: 'Enter Scores', href: '/enter-scores', icon: 'edit', roles: ['teacher'] },
      { label: 'My Timetable', href: '/my-timetable', icon: 'calendar', roles: ['teacher'] },
    ],
  },
  {
    title: 'Parent Portal',
    items: [
      { label: 'My Children', href: '/my-children', icon: 'users', roles: ['parent'], permissions: ['view_children'] },
      { label: 'My Fees', href: '/my-fees', icon: 'dollar', roles: ['parent'], permissions: ['view_children_fees'] },
    ],
  },
  {
    title: 'Student Portal',
    items: [
      { label: 'My Exams', href: '/my-exams', icon: 'clipboard', roles: ['student'], permissions: ['take_exams'] },
      { label: 'My Results', href: '/my-results', icon: 'bar-chart', roles: ['student'], permissions: ['view_my_results'] },
      { label: 'My Attendance', href: '/my-attendance', icon: 'check-circle', roles: ['student'], permissions: ['view_my_attendance'] },
      { label: 'My Fees', href: '/my-fees', icon: 'dollar', roles: ['student'], permissions: ['view_my_results'] },
      { label: 'My Report Card', href: '/my-report-card', icon: 'award', roles: ['student'], permissions: ['view_my_report_card'] },
      { label: 'My Timetable', href: '/my-timetable', icon: 'calendar', roles: ['student'], permissions: ['view_my_timetable'] },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Subscriptions', href: '/subscriptions', icon: 'star', permissions: ['read_subscriptions'] },
      { label: 'Audit Logs', href: '/audit-logs', icon: 'shield', permissions: ['view_audit_logs'] },
      { label: 'Settings', href: '/settings', icon: 'settings', permissions: ['read_school_settings'] },
    ],
  },
];

const iconMap: Record<string, string> = {
  grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z',
  'book-open': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3Z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M16 13H8M16 17H8M10 9H8',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18',
  clipboard: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9V2Z',
  award: 'M12 15l-3 5 .5-3.5L7 15h5Zm0 0l3 5-.5-3.5L17 15h-5ZM12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z',
  'bar-chart': 'M12 20V10M18 20V4M6 20v-4',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5Z',
  settings: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  dollar: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  'credit-card': 'M1 4h22a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM1 10h22M8 16h2',
  bank: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'message-circle': 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
};

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pageContext = usePageContext();
  const currentPath = (pageContext as any).urlPathname || '';
  // Handle SSR - useAuth returns safe defaults during server rendering
  const auth = useAuth();
  const { canAny, permissions } = usePermission();

  // Get user's role from first school (for backwards compatibility)
  const userRole = auth?.user?.schools?.[0]?.roles?.[0] || 'admin';

  // Wait for auth to load before filtering (prevents showing all tabs on initial load)
  if (auth.isLoading || !auth.user) {
    return null;
  }

  // Filter sections to only show items the user has access to
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Role check — user must have one of the specified roles
        if (item.roles && item.roles.length > 0) {
          if (!item.roles.includes(userRole)) return false;
        }
        // Permission check — user must have at least one of the specified permissions
        if (item.permissions && item.permissions.length > 0) {
          if (!canAny(item.permissions)) return false;
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-linear-to-br from-blue-500 to-blue-700 z-30 transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full" />
        <div className="absolute bottom-20 -right-8 w-48 h-48 bg-blue-400/15 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300/15 rounded-full" />
      </div>

      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-blue-400/30 relative z-10">
        {!collapsed && <span className="text-xl font-bold text-white">Sqoolify</span>}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 text-blue-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="p-3 overflow-y-auto h-[calc(100%-4rem)] relative z-10">
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'mt-4' : ''}>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href + '/'));
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
                      isActive
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={isActive ? 2 : 1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={iconMap[item.icon] || iconMap.grid}
                      />
                    </svg>
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
