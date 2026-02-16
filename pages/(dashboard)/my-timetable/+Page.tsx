import { useState, useEffect, useCallback } from 'react';
import { timetableService, sessionService } from '../../../lib/api-services';
import { TimetableEntry, PeriodConfig, Session } from '../../../lib/types';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import { useAuth } from '../../../lib/auth-context';
import { toast } from 'sonner';

function getTeacherName(teacher: any): string {
  if (typeof teacher === 'object' && teacher.user && typeof teacher.user === 'object') {
    return `${teacher.user.firstName} ${teacher.user.lastName}`;
  }
  return '';
}

function getClassName(cls: any): string {
  if (typeof cls === 'object') {
    return `${cls.name}${cls.section ? ` - ${cls.section}` : ''}`;
  }
  return '';
}

export default function MyTimetablePage() {
  const { user } = useAuth();
  const userRole = user?.role || '';

  const [sessions, setSessions] = useState<Session[]>([]);
  const [periodConfig, setPeriodConfig] = useState<PeriodConfig | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      const res = await sessionService.getAll({ limit: 10 });
      setSessions(res.data || []);
      if ((res.data || []).length > 0 && !selectedSession) {
        const current = (res.data || []).find((s: Session) => s.isCurrent);
        if (current) setSelectedSession(current._id);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [timetableRes, configRes] = await Promise.all([
        timetableService.getMyTimetable(selectedSession ? { sessionId: selectedSession } : undefined),
        timetableService.getPeriodConfig(selectedSession ? { sessionId: selectedSession } : undefined),
      ]);
      setEntries(timetableRes.data || []);
      if (configRes.data) {
        setPeriodConfig(configRes.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const days = periodConfig?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = periodConfig?.periods?.sort((a, b) => a.order - b.order) || [];

  const entryMap = new Map<string, TimetableEntry>();
  entries.forEach((entry) => {
    entryMap.set(`${entry.day}-${entry.periodOrder}`, entry);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Timetable' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-sm text-gray-500 mt-1">
            {userRole === 'teacher' ? 'Your teaching schedule across all classes' : 'Your class schedule'}
          </p>
        </div>
        <div>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Current Session</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!periodConfig ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No timetable configuration has been set up yet.
        </div>
      ) : periods.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No periods configured yet.
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No timetable entries found for this session.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-36">Period</th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periods.map((period) => (
                <tr key={period.order} className={period.isBreak ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 border-r border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{period.label}</div>
                    <div className="text-xs text-gray-500">{period.startTime} - {period.endTime}</div>
                  </td>
                  {period.isBreak ? (
                    <td colSpan={days.length} className="px-4 py-3 text-center text-sm text-gray-400 italic">
                      Break
                    </td>
                  ) : (
                    days.map((day) => {
                      const entry = entryMap.get(`${day}-${period.order}`);
                      if (!entry) {
                        return <td key={day} className="px-3 py-2 text-center border-r border-gray-50 text-gray-300">—</td>;
                      }
                      const subject = typeof entry.subject === 'object' ? entry.subject : null;
                      const teacher = typeof entry.teacher === 'object' ? entry.teacher : null;
                      const cls = typeof entry.class === 'object' ? entry.class : null;
                      return (
                        <td key={day} className="px-3 py-2 text-center border-r border-gray-50">
                          <div className="text-sm font-medium text-gray-900">{subject?.name || ''}</div>
                          {userRole === 'teacher' && cls && (
                            <div className="text-xs text-blue-600">{getClassName(cls)}</div>
                          )}
                          {userRole !== 'teacher' && teacher && (
                            <div className="text-xs text-gray-500">{getTeacherName(teacher)}</div>
                          )}
                          {entry.room && <div className="text-xs text-gray-400">{entry.room}</div>}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
