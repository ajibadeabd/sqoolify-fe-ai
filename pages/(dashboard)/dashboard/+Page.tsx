import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../lib/auth-context';
import { dashboardService, noticeService, sessionService, chatService } from '../../../lib/api-services';
import { Notice, Session, DashboardStats, AdminDashboardStats, TeacherDashboardStats, StudentDashboardStats, ParentDashboardStats } from '../../../lib/types';
import AdminDashboard from '../../../components/dashboard/AdminDashboard';
import TeacherDashboard from '../../../components/dashboard/TeacherDashboard';
import StudentDashboard from '../../../components/dashboard/StudentDashboard';
import ParentDashboard from '../../../components/dashboard/ParentDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const canReadSessions = (user?.permissions || []).includes('read_sessions');
      const [statsRes, noticesRes, sessionRes, chatRes] = await Promise.all([
        dashboardService.getStats(),
        noticeService.getAll({ limit: 5 }),
        canReadSessions ? sessionService.getCurrent().catch(() => null) : Promise.resolve(null),
        chatService.getRooms().catch(() => null),
      ]);

      setStats(statsRes.data);
      setNotices(noticesRes.data || []);
      if (sessionRes) {
        setCurrentSession(sessionRes.data);
      }
      setChatRooms(chatRes?.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userName = user?.firstName || 'User';

  // Determine which dashboard to render based on role from stats
  const role = stats?.role || 'admin';

  switch (role) {
    case 'teacher':
      return (
        <TeacherDashboard
          stats={stats as TeacherDashboardStats}
          notices={notices}
          currentSession={currentSession}
          userName={userName}
          chatRooms={chatRooms}
        />
      );
    case 'student':
      return (
        <StudentDashboard
          stats={stats as StudentDashboardStats}
          notices={notices}
          currentSession={currentSession}
          userName={userName}
          chatRooms={chatRooms}
        />
      );
    case 'parent':
      return (
        <ParentDashboard
          stats={stats as ParentDashboardStats}
          notices={notices}
          currentSession={currentSession}
          userName={userName}
        />
      );
    case 'admin':
    default:
      return (
        <AdminDashboard
          stats={stats as AdminDashboardStats}
          notices={notices}
          currentSession={currentSession}
          userName={userName}
          chatRooms={chatRooms}
        />
      );
  }
}
