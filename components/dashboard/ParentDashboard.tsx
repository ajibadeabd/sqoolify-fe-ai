import { Notice, Session, ParentDashboardStats, ChildAttendanceSummary, ParentUpcomingFee, ParentRecentResult, ParentRecentPayment } from '../../lib/types';
import { useAppConfig } from '../../lib/use-app-config';
import StatsCard from '../ui/StatsCard';
import Badge from '../ui/Badge';

interface ParentDashboardProps {
  stats: ParentDashboardStats;
  notices: Notice[];
  currentSession: Session | null;
  userName: string;
}

function AttendanceDonut({ data }: { data: ChildAttendanceSummary }) {
  const segments = [
    { label: 'Present', value: data.present, color: '#22c55e' },
    { label: 'Absent', value: data.absent, color: '#ef4444' },
    { label: 'Late', value: data.late, color: '#f59e0b' },
    { label: 'Excused', value: data.excused, color: '#3b82f6' },
  ].filter(s => s.value > 0);

  const total = data.total;

  if (total === 0) {
    return <p className="text-gray-400 text-sm py-4">No attendance data yet.</p>;
  }

  let cumulativePercent = 0;
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <div className="w-36 h-36 flex-shrink-0">
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
            {data.attendanceRate}%
          </text>
          <text x="18" y="21" textAnchor="middle" className="text-[2.5px] fill-gray-500">
            rate
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
        <div className="text-xs text-gray-400 mt-1">Total: {total} days</div>
      </div>
    </div>
  );
}

const feeStatusVariant: Record<string, 'danger' | 'warning' | 'success'> = {
  unpaid: 'danger',
  partial: 'warning',
  paid: 'success',
};

const paymentStatusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
};

function formatDate(date: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ParentDashboard({ stats, notices, currentSession, userName }: ParentDashboardProps) {
  const { formatCurrency } = useAppConfig();
  const childrenAttendance = stats?.childrenAttendance || [];
  const upcomingFees = stats?.upcomingFees || [];
  const recentResults = stats?.recentResults || [];
  const recentPayments = stats?.recentPayments || [];

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

      {/* Parent Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="My Children" value={stats?.children || 0} icon="users" color="blue" />
        <StatsCard title="Total Fees" value={formatCurrency(stats?.totalFees)} icon="currency" color="purple" />
        <StatsCard title="Amount Paid" value={formatCurrency(stats?.totalPaid)} icon="clipboard" color="green" />
        <StatsCard title="Outstanding Balance" value={formatCurrency(stats?.totalPendingFees)} icon="alert" color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance per child */}
        {childrenAttendance.length > 0 ? (
          childrenAttendance.map((child) => (
            <div key={child._id} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{child.name}</h3>
              <AttendanceDonut data={child} />
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
            <p className="text-gray-400 text-sm">No attendance data yet.</p>
          </div>
        )}

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
      </div>

      {/* Upcoming Fees, Recent Results, Recent Payments */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Upcoming Fees */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Fees</h3>
            <a href="/my-fees" className="text-sm text-blue-600 hover:text-blue-800">View all</a>
          </div>
          {upcomingFees.length === 0 ? (
            <p className="text-gray-400 text-sm">No outstanding fees.</p>
          ) : (
            <div className="space-y-3">
              {upcomingFees.map((fee) => (
                <div key={fee._id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{fee.childName}</p>
                    <Badge variant={feeStatusVariant[fee.status] || 'default'}>{fee.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Balance: <span className="font-medium text-gray-700">{formatCurrency(fee.balance)}</span>
                    </p>
                    {fee.dueDate && (
                      <p className="text-xs text-gray-400">Due {formatDate(fee.dueDate)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Results</h3>
          </div>
          {recentResults.length === 0 ? (
            <p className="text-gray-400 text-sm">No exam results yet.</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result._id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{result.childName}</p>
                    {result.grade && (
                      <Badge variant={result.grade === 'A' ? 'success' : result.grade === 'F' ? 'danger' : 'default'}>
                        {result.grade}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{result.subject} — {result.examName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      Score: <span className="font-medium text-gray-700">{result.score}</span>
                      {result.maxScore != null && <span className="text-gray-400">/{result.maxScore}</span>}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(result.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Payments</h3>
            <a href="/my-fees" className="text-sm text-blue-600 hover:text-blue-800">View all</a>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-gray-400 text-sm">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment._id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{payment.childName}</p>
                    <Badge variant={paymentStatusVariant[payment.status] || 'default'}>{payment.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(payment.date)}</p>
                  </div>
                  {payment.reference && (
                    <p className="text-xs text-gray-400 mt-1">Ref: {payment.reference}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
