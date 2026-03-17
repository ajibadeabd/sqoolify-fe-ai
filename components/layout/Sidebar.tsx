import { useState, useEffect, useRef } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth-context';
import { usePermission } from '../../lib/use-permission';
import { useSchool } from '../../lib/school-context';
import { useSchoolStore } from '../../lib/stores/school-store';
import { schoolService } from '../../lib/api-services';
import Modal from '../ui/Modal';
import countries from '../../lib/countries.json';

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
      { label: 'Inter-School', href: '/inter-school', icon: 'globe', permissions: ['read_inter_school'] },
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
      { label: 'Site Builder', href: '/site-builder', icon: 'globe', permissions: ['write_school_settings'] },
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
  globe: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  'message-circle': 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
};

// Section icons for collapsed view
const sectionIconMap: Record<string, string> = {
  Overview: 'grid',
  People: 'users',
  Academics: 'book-open',
  Finance: 'dollar',
  Communication: 'message-circle',
  'Teacher Portal': 'briefcase',
  'Parent Portal': 'heart',
  'Student Portal': 'clipboard',
  Admin: 'settings',
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void }) {
  const pageContext = usePageContext();
  const currentPath = (pageContext as any).urlPathname || '';
  // Handle SSR - useAuth returns safe defaults during server rendering
  const auth = useAuth();
  const { canAny, permissions } = usePermission();
  const { school: currentSchool } = useSchool();

  const userRole = auth?.user?.role || '';
  const schoolName = currentSchool?.name || 'Sqoolify';

  // School switcher state
  const isSchoolOwner = auth?.user?.schools?.some(
    (s) => s.schoolId === (auth.user?.currentSchool || auth.user?.school) && s.roles.includes('school_owner'),
  );
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const { ownedSchools, ownedSchoolsLoading, fetchOwnedSchools } = useSchoolStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSchoolDropdownOpen(false);
      }
    };
    if (schoolDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [schoolDropdownOpen]);

  // Fetch owned schools when dropdown opens (store handles dedup)
  useEffect(() => {
    if (schoolDropdownOpen && isSchoolOwner) {
      fetchOwnedSchools();
    }
  }, [schoolDropdownOpen]);

  // Add school modal state
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchoolForm, setNewSchoolForm] = useState({ name: '', country: '', slug: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [creatingSchool, setCreatingSchool] = useState(false);
  const slugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4120/api/v1';

  // Auto-generate slug from school name
  useEffect(() => {
    if (!slugTouched && newSchoolForm.name) {
      const autoSlug = newSchoolForm.name
        .toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setNewSchoolForm((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [newSchoolForm.name, slugTouched]);

  // Debounced slug availability check
  useEffect(() => {
    if (!showAddSchool || !newSchoolForm.slug || newSchoolForm.slug.length < 2) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    if (slugTimerRef.current) clearTimeout(slugTimerRef.current);
    slugTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/check-slug/${newSchoolForm.slug}`);
        const json = await res.json();
        setSlugStatus(json.data?.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);
    return () => { if (slugTimerRef.current) clearTimeout(slugTimerRef.current); };
  }, [newSchoolForm.slug, showAddSchool]);

  // Track which sections are collapsed
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Auto-expand the section containing the active route
  useEffect(() => {
    const activeSection = navSections.find((section) =>
      section.items.some((item) =>
        currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href + '/'))
      )
    );
    if (activeSection && collapsedSections[activeSection.title]) {
      setCollapsedSections((prev) => ({ ...prev, [activeSection.title]: false }));
    }
  }, [currentPath]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

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
    <>
    {mobileOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onMobileClose}
      />
    )}
    <aside
      className={`fixed top-0 left-0 h-full transition-all duration-300 w-64 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 z-50 md:z-30 ${collapsed ? 'md:w-16' : 'md:w-64'}`}
      style={{ background: 'linear-gradient(to bottom right, var(--color-primary, #3B82F6), var(--color-secondary, #2563EB))' }}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute bottom-20 -right-8 w-48 h-48 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Logo / School Switcher */}
      <div className="h-16 flex items-center justify-between px-4 relative z-20" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', overflow: 'visible' }} ref={dropdownRef}>
        <div
          className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'md:hidden' : ''} ${isSchoolOwner ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={() => isSchoolOwner && setSchoolDropdownOpen(!schoolDropdownOpen)}
        >
          {currentSchool?.logo ? (
            <img src={currentSchool.logo} alt={schoolName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {schoolName.charAt(0)}
            </div>
          )}
          <span className="text-lg font-bold text-white truncate">{schoolName}</span>
          {isSchoolOwner && !collapsed && (
            <svg className={`w-4 h-4 text-white/60 shrink-0 transition-transform ${schoolDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hidden md:block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* School Switcher Dropdown */}
        {schoolDropdownOpen && isSchoolOwner && (
          <div className="absolute top-16 left-2 right-2 bg-white rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
            {ownedSchoolsLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Loading...</div>
            ) : (
              <>
                {ownedSchools.map((s) => {
                  const isCurrent = s._id === (currentSchool?._id || auth.user?.currentSchool || auth.user?.school);
                  return (
                    <button
                      key={s._id}
                      onClick={() => {
                        if (!isCurrent) {
                          auth.selectSchool(s._id).then(() => {
                            window.location.href = '/dashboard';
                          });
                        }
                        setSchoolDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        isCurrent ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <span className="truncate">{s.name}</span>
                      {isCurrent && (
                        <svg className="w-4 h-4 ml-auto text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSchoolDropdownOpen(false);
                      setShowAddSchool(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <span>Add School</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="p-3 overflow-y-auto h-[calc(100%-4rem)] relative z-10">
        {filteredSections.map((section, sectionIndex) => {
          const isSectionCollapsed = collapsedSections[section.title] || false;
          const hasActiveItem = section.items.some(
            (item) => currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href + '/'))
          );
          const sectionIcon = sectionIconMap[section.title] || 'grid';

          return (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-2' : ''}>
              {/* Section header — clickable to collapse */}
              <button
                onClick={() => !collapsed && toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg transition-colors group ${
                  collapsed ? 'md:justify-center' : ''
                } ${hasActiveItem && isSectionCollapsed ? 'bg-white/10' : 'hover:bg-white/5'}`}
                title={collapsed ? section.title : undefined}
              >
                {collapsed ? (
                  <svg
                    className="w-4 h-4 text-white/50 shrink-0 hidden md:block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[sectionIcon] || iconMap.grid} />
                  </svg>
                ) : null}
                <span className={`text-xs font-semibold text-white/50 uppercase tracking-wider ${collapsed ? 'md:hidden' : ''}`}>
                  {section.title}
                </span>
                {!collapsed && (
                  <svg
                    className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${
                      isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                    } ${collapsed ? 'md:hidden' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Section items with collapse animation */}
              <div
                className={`space-y-0.5 overflow-hidden transition-all duration-200 ${
                  isSectionCollapsed && !collapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
                }`}
              >
                {section.items.map((item) => {
                  const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href + '/'));
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm ${
                        isActive
                          ? 'bg-white/20 text-white font-medium'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                      <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>

    {/* Add School Modal */}
    <Modal open={showAddSchool} onClose={() => { setShowAddSchool(false); setNewSchoolForm({ name: '', country: '', slug: '' }); setSlugTouched(false); setSlugStatus('idle'); }} title="Add New School">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newSchoolForm.name.trim()) return;
          if (slugStatus === 'taken') {
            toast.error('This school URL is already taken. Please choose a different one.');
            return;
          }
          setCreatingSchool(true);
          try {
            const res = await schoolService.create({
              name: newSchoolForm.name.trim(),
              country: newSchoolForm.country || undefined,
            });
            const created = res.data;
            if (created) {
              useSchoolStore.getState().addOwnedSchool(created);
              toast.success('School created successfully');
              setShowAddSchool(false);
              setNewSchoolForm({ name: '', country: '', slug: '' });
              setSlugTouched(false);
              setSlugStatus('idle');
            }
          } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to create school';
            toast.error(msg);
          } finally {
            setCreatingSchool(false);
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">School Name</label>
            <input
              type="text"
              value={newSchoolForm.name}
              onChange={(e) => setNewSchoolForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Bright Future Academy"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
            <select
              value={newSchoolForm.country}
              onChange={(e) => setNewSchoolForm((prev) => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
            >
              <option value="">Select your country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your School URL</label>
            <div className="flex items-center gap-0">
              <input
                type="text"
                value={newSchoolForm.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
                  setNewSchoolForm((prev) => ({ ...prev, slug: value }));
                }}
                placeholder="bright-future-academy"
                className="flex-1 px-4 py-3 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
              />
              <span className="px-3 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-500 whitespace-nowrap">
                .sqoolify.com
              </span>
            </div>
            {newSchoolForm.slug && (
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-gray-400">
                  Your school will be at <span className="font-medium" style={{ color: 'var(--color-primary, #3B82F6)' }}>{newSchoolForm.slug}.sqoolify.com</span>
                </p>
                {slugStatus === 'checking' && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                    Checking...
                  </span>
                )}
                {slugStatus === 'available' && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Available
                  </span>
                )}
                {slugStatus === 'taken' && (
                  <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Taken
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddSchool(false); setNewSchoolForm({ name: '', country: '', slug: '' }); setSlugTouched(false); setSlugStatus('idle'); }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingSchool || !newSchoolForm.name.trim() || slugStatus === 'taken'}
              className="px-4 py-2.5 text-sm text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary, #3B82F6)' }}
            >
              {creatingSchool ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : 'Create School'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
    </>
  );
}
