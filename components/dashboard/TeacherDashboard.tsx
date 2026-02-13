import { Notice, Session, TeacherDashboardStats } from '../../lib/types';
import StatsCard from '../ui/StatsCard';

interface TeacherDashboardProps {
  stats: TeacherDashboardStats;
  notices: Notice[];
  currentSession: Session | null;
  userName: string;
  chatRooms?: any[];
}

export default function TeacherDashboard({ stats, notices, currentSession, userName, chatRooms = [] }: TeacherDashboardProps) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
        {currentSession && (
          <p className="text-gray-500 text-sm mt-1">
            Current Session: {currentSession.name} | Term {currentSession.currentTerm || 1}
          </p>
        )}
      </div>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatsCard title="My Classes" value={stats?.myClasses || 0} icon="book" color="purple" />
        <StatsCard title="My Students" value={stats?.studentsCount || 0} icon="users" color="blue" />
        <StatsCard title="Upcoming Exams" value={stats?.upcomingExams || 0} icon="clipboard" color="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Notices */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Notices</h3>
            <a href="/notices" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </a>
          </div>
          {notices.length === 0 ? (
            <p className="text-gray-500 text-sm">No notices yet.</p>
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  className={`p-3 rounded-lg border ${
                    notice.isPinned ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notice.isPinned && (
                      <span className="text-blue-600 mt-0.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{notice.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/classes"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-600 text-sm font-medium hover:bg-purple-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
              View My Classes
            </a>
            <a
              href="/attendance"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Take Attendance
            </a>
            <a
              href="/exams"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              View Exams
            </a>
            <a
              href="/students"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              View Students
            </a>
            <a
              href="/notices/add"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
              </svg>
              Post Notice
            </a>
          </div>
        </div>
      </div>

      {/* Chat Rooms */}
      {chatRooms.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chat Rooms</h3>
            <a href="/chat-rooms" className="text-sm text-blue-600 hover:text-blue-800">View all</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chatRooms.slice(0, 4).map((room: any) => (
              <a
                key={room._id}
                href={`/chat-rooms/${room._id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{room.name}{room.section ? ` - ${room.section}` : ''}</p>
                  <p className="text-xs text-gray-500">{room.students?.length || 0} students</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
