import { Notice, Session, AdminDashboardStats, AttendanceBreakdown, ClassAttendance } from '../../lib/types';
import { useAppConfig } from '../../lib/use-app-config';
import StatsCard from '../ui/StatsCard';

interface AdminDashboardProps {
  stats: AdminDashboardStats;
  notices: Notice[];
  currentSession: Session | null;
  userName: string;
  chatRooms?: any[];
}

export default function AdminDashboard({ stats, notices, currentSession, userName, chatRooms = [] }: AdminDashboardProps) {
  const { formatCurrency } = useAppConfig();

  const formatPercent = (value?: number) => {
    if (value === undefined) return '---';
    return `${value.toFixed(1)}%`;
  };

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

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Students" value={stats?.totalStudents || 0} icon="users" color="blue" />
        <StatsCard title="Total Teachers" value={stats?.totalTeachers || 0} icon="briefcase" color="green" />
        <StatsCard title="Total Classes" value={stats?.totalClasses || 0} icon="book" color="purple" />
        <StatsCard title="Active Exams" value={stats?.activeExams || 0} icon="clipboard" color="orange" />
      </div>

      {/* Secondary Stats (Financial) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Parents" value={stats?.totalParents || 0} icon="users" color="indigo" />
        <StatsCard title="Revenue Collected" value={formatCurrency(stats?.totalRevenue)} icon="currency" color="emerald" />
        <StatsCard title="Outstanding Fees" value={formatCurrency(stats?.outstandingFees)} icon="alert" color="red" />
      </div>

      {/* Attendance Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Pie/Donut Chart - Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
              <p className="text-sm text-gray-500">Overall rate: {formatPercent(stats?.attendanceRate)}</p>
            </div>
          </div>
          {(() => {
            const bd = stats?.attendanceBreakdown || { present: 0, absent: 0, late: 0, excused: 0 };
            const total = bd.present + bd.absent + bd.late + bd.excused;
            if (total === 0) return <p className="text-gray-400 text-sm">No attendance data yet.</p>;

            const segments = [
              { label: 'Present', value: bd.present, color: '#22c55e' },
              { label: 'Absent', value: bd.absent, color: '#ef4444' },
              { label: 'Late', value: bd.late, color: '#f59e0b' },
              { label: 'Excused', value: bd.excused, color: '#3b82f6' },
            ].filter(s => s.value > 0);

            let cumulativePercent = 0;
            const radius = 15.9155;
            const circumference = 2 * Math.PI * radius;

            return (
              <div className="flex items-center gap-6">
                <div className="w-40 h-40 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    {segments.map((seg, i) => {
                      const percent = (seg.value / total) * 100;
                      const dashArray = `${(percent / 100) * circumference} ${circumference}`;
                      const rotation = (cumulativePercent / 100) * 360 - 90;
                      cumulativePercent += percent;
                      return (
                        <circle
                          key={i}
                          cx="18" cy="18" r={radius}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="4"
                          strokeDasharray={dashArray}
                          transform={`rotate(${rotation} 18 18)`}
                        />
                      );
                    })}
                    <text x="18" y="17" textAnchor="middle" className="text-[5px] font-bold fill-gray-900">
                      {total}
                    </text>
                    <text x="18" y="21" textAnchor="middle" className="text-[2.5px] fill-gray-500">
                      records
                    </text>
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-sm text-gray-700">
                        {seg.label}: <span className="font-medium">{seg.value}</span>
                        <span className="text-gray-400 ml-1">({((seg.value / total) * 100).toFixed(1)}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Bar Chart - Attendance by Class */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance by Class</h3>
          {(!stats?.attendanceByClass || stats.attendanceByClass.length === 0) ? (
            <p className="text-gray-400 text-sm">No attendance data yet.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.attendanceByClass.map((cls, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate mr-2">{cls.className}</span>
                    <span className="text-gray-500 flex-shrink-0">{cls.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${cls.attendanceRate}%`,
                        backgroundColor: cls.attendanceRate >= 80 ? '#22c55e' : cls.attendanceRate >= 60 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              href="/students/add"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              Add New Student
            </a>
            <a
              href="/teachers/add"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
              </svg>
              Add New Teacher
            </a>
            <a
              href="/exams"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-600 text-sm font-medium hover:bg-purple-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              Create Exam
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
              href="/fees"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-medium hover:bg-emerald-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
              Manage Fees
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chatRooms.slice(0, 6).map((room: any) => (
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
