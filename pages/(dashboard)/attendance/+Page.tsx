import { useState, useEffect, useCallback } from 'react';
import { attendanceService, classService, sessionService } from '../../../lib/api-services';
import { Attendance, SchoolClass, Student, Session } from '../../../lib/types';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import { useAppConfig } from '../../../lib/use-app-config';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  remark?: string;
}

export default function AttendancePage() {
  const { termsPerSession } = useAppConfig();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Take attendance state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [takeSearch, setTakeSearch] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState<'take' | 'view'>('take');

  // View records state
  const [viewSubMode, setViewSubMode] = useState<'class' | 'student'>('class');
  const [viewClassId, setViewClassId] = useState('');
  const [viewStartDate, setViewStartDate] = useState('');
  const [viewEndDate, setViewEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [classRecords, setClassRecords] = useState<Attendance[]>([]);
  const [classSummary, setClassSummary] = useState<any[]>([]);
  const [classSummaryTab, setClassSummaryTab] = useState<'daily' | 'summary'>('daily');
  const [viewStudentId, setViewStudentId] = useState('');
  const [viewStudents, setViewStudents] = useState<Student[]>([]);
  const [viewStudentRecords, setViewStudentRecords] = useState<Attendance[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [expandedSearch, setExpandedSearch] = useState('');
  const [dailyPage, setDailyPage] = useState(1);
  const [summarySearch, setSummarySearch] = useState('');
  const [summarySort, setSummarySort] = useState<'rate-asc' | 'rate-desc' | 'name'>('rate-asc');
  const DAILY_PAGE_SIZE = 15;

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [classRes, sessionRes] = await Promise.all([
        classService.getAll({ limit: 100 }),
        sessionService.getAll({ limit: 10 }),
      ]);
      setClasses(classRes.data || []);
      setSessions(sessionRes.data || []);
      if ((sessionRes.data || []).length > 0 && !selectedSession) setSelectedSession(sessionRes.data[0]._id);
      if ((classRes.data || []).length > 0 && !selectedClass) setSelectedClass(classRes.data[0]._id);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) {
      setStudents([]);
      setRecords([]);
      return;
    }
    try {
      const res = await classService.getStudents(selectedClass);
      const studentList = (res.data as any)?.students || [];
      setStudents(studentList);
      setRecords(studentList.map((s: Student) => ({
        studentId: s._id,
        studentName: (s.user && typeof s.user === 'object') ? `${s.user.firstName} ${s.user.lastName}` : 'Unknown',
        status: 'present' as AttendanceStatus,
        remark: '',
      })));
    } catch {
      setStudents([]);
      setRecords([]);
    }
  }, [selectedClass]);

  const fetchExistingAttendance = useCallback(async () => {
    if (!selectedClass || !selectedDate) return;
    try {
      const res = await attendanceService.getAll({
        classId: selectedClass,
        startDate: selectedDate,
        endDate: selectedDate,
        limit: 1,
      });
      const existing = res.data?.[0];
      if (existing && existing.records) {
        setRecords(prev => prev.map(r => {
          const existingRecord = existing.records.find(
            (er: any) => er.student === r.studentId || er.student?._id === r.studentId
          );
          if (existingRecord) {
            return { ...r, status: existingRecord.status, remark: existingRecord.remark || '' };
          }
          return { ...r, status: 'absent' as AttendanceStatus, remark: '' };
        }));
      }
    } catch {
      // No existing attendance
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => {
    if (records.length > 0) fetchExistingAttendance();
  }, [selectedDate, records.length]);

  // View mode: load students when class selected for student sub-mode
  const fetchViewStudents = useCallback(async () => {
    if (!viewClassId) { setViewStudents([]); setViewStudentId(''); return; }
    try {
      const res = await classService.getStudents(viewClassId);
      setViewStudents((res.data as any)?.students || []);
    } catch {
      setViewStudents([]);
    }
  }, [viewClassId]);

  useEffect(() => {
    if (viewMode === 'view') fetchViewStudents();
  }, [viewClassId, viewMode, fetchViewStudents]);

  useEffect(() => {
    if (viewMode === 'view' && viewClassId) fetchClassView();
  }, [viewClassId, viewStartDate, viewEndDate]);

  useEffect(() => {
    if (viewMode === 'view' && viewStudentId) fetchStudentView();
  }, [viewStudentId, viewStartDate, viewEndDate]);

  const fetchClassView = async () => {
    if (!viewClassId) return;
    setViewLoading(true);
    setClassRecords([]);
    setClassSummary([]);
    try {
      const params: any = { classId: viewClassId, limit: 100 };
      if (viewStartDate) params.startDate = viewStartDate;
      if (viewEndDate) params.endDate = viewEndDate;
      const [recordsRes, summaryRes] = await Promise.all([
        attendanceService.getAll(params),
        attendanceService.getSummary(viewClassId),
      ]);
      setClassRecords((recordsRes.data || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setClassSummary(summaryRes.data || []);
      setDailyPage(1);
      setExpandedDate(null);
      setSummarySearch('');
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setViewLoading(false);
    }
  };

  const fetchStudentView = async () => {
    if (!viewStudentId) return;
    setViewLoading(true);
    setViewStudentRecords([]);
    try {
      const params: any = { studentId: viewStudentId, limit: 100 };
      if (viewStartDate) params.startDate = viewStartDate;
      if (viewEndDate) params.endDate = viewEndDate;
      const res = await attendanceService.getAll(params);
      setViewStudentRecords((res.data || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setViewLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, remark } : r));
  };

  const markAllAs = (status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => ({ ...r, status })));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSession || records.length === 0) {
      setError('Please select a class, session and ensure students are loaded');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await attendanceService.create({
        classId: selectedClass,
        sessionId: selectedSession,
        date: selectedDate,
        term: parseInt(selectedTerm),
        records: records.map(r => ({
          studentId: r.studentId,
          status: r.status,
          remark: r.remark || undefined,
        })),
      });
      setSuccess('Attendance saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-300';
      case 'absent': return 'bg-red-100 text-red-700 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'excused': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'late': return 'bg-yellow-100 text-yellow-700';
      case 'excused': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const countByStatus = (recs: any[], status: string) =>
    recs.filter(r => r.status === status).length;

  const getStudentName = (studentId: string) => {
    const s = viewStudents.find(s => s._id === studentId);
    if (!s) return studentId;
    return s.user && typeof s.user === 'object' ? `${s.user.firstName} ${s.user.lastName}` : 'Unknown';
  };

  // Compute student summary stats from loaded records
  const studentAttendanceSummary = (() => {
    const total = viewStudentRecords.length;
    let present = 0, absent = 0, late = 0, excused = 0;
    for (const doc of viewStudentRecords) {
      const r = (doc.records as any[]).find(
        r => r.student === viewStudentId || r.student?._id === viewStudentId
      );
      if (!r) continue;
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
    }
    return { total, present, absent, late, excused, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  })();

  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    excused: records.filter(r => r.status === 'excused').length,
    total: records.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Attendance' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-sm text-gray-500 mt-1">Take and manage student attendance</p>
        </div>
        {/* Mode tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => setViewMode('take')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'take' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Take Attendance
          </button>
          <button
            onClick={() => setViewMode('view')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            View Records
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>
      )}

      {/* ── TAKE ATTENDANCE ── */}
      {viewMode === 'take' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Session</option>
                  {sessions.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: termsPerSession }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Term {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSubmit} loading={saving} disabled={records.length === 0}>
                  Save Attendance
                </Button>
              </div>
            </div>
          </div>

          {records.length > 0 && (
            <>
              {/* Compact stats bar */}
              <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 mb-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-3 flex-1 min-w-48">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="text-green-700">{stats.present} Present</span>
                    <span className="text-red-700">{stats.absent} Absent</span>
                    <span className="text-yellow-700">{stats.late} Late</span>
                    <span className="text-blue-700">{stats.excused} Excused</span>
                    <span className="text-gray-500">{stats.total} Total</span>
                  </div>
                </div>
              </div>

              {/* Search + bulk actions toolbar */}
              {(() => {
                const filtered = records.filter(r =>
                  !takeSearch || r.studentName.toLowerCase().includes(takeSearch.toLowerCase())
                );
                const rowBorder = (status: AttendanceStatus) => {
                  switch (status) {
                    case 'present': return 'border-l-4 border-l-green-400';
                    case 'absent': return 'border-l-4 border-l-red-400';
                    case 'late': return 'border-l-4 border-l-yellow-400';
                    case 'excused': return 'border-l-4 border-l-blue-400';
                  }
                };
                const rowBg = (status: AttendanceStatus) => {
                  switch (status) {
                    case 'present': return 'bg-green-50/40';
                    case 'absent': return 'bg-red-50/60';
                    case 'late': return 'bg-yellow-50/60';
                    case 'excused': return 'bg-blue-50/40';
                  }
                };

                return (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="relative flex-1 min-w-48 max-w-64">
                        <input
                          type="text"
                          value={takeSearch}
                          onChange={(e) => setTakeSearch(e.target.value)}
                          placeholder="Search student..."
                          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <svg className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      {takeSearch && (
                        <span className="text-xs text-gray-500">{filtered.length} of {records.length} students</span>
                      )}
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => markAllAs('present')} className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                          ✓ All Present
                        </button>
                        <button onClick={() => markAllAs('absent')} className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                          ✗ All Absent
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 360px)', minHeight: 200 }}>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                          <tr>
                            <th className="pl-5 pr-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-8">#</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                            <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Remark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filtered.map((record, index) => (
                            <tr key={record.studentId} className={`${rowBg(record.status)} ${rowBorder(record.status)} transition-colors`}>
                              <td className="pl-5 pr-3 py-2 text-xs text-gray-400">{index + 1}</td>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{record.studentName}</td>
                              <td className="px-3 py-2">
                                <div className="flex justify-center gap-1.5">
                                  {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusChange(record.studentId, status)}
                                      className={`px-2.5 py-0.5 text-xs rounded-full border capitalize font-medium transition-colors ${
                                        record.status === status
                                          ? getStatusColor(status)
                                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600'
                                      }`}
                                    >
                                      {status === 'present' ? 'P' : status === 'absent' ? 'A' : status === 'late' ? 'L' : 'E'}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={record.remark || ''}
                                  onChange={(e) => handleRemarkChange(record.studentId, e.target.value)}
                                  placeholder="Remark..."
                                  className="w-full px-2 py-0.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                                />
                              </td>
                            </tr>
                          ))}
                          {filtered.length === 0 && (
                            <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-gray-400">No students match "{takeSearch}"</td></tr>
                          )}
                        </tbody>
                      </table>
                      </div>
                      {filtered.length > 15 && (
                        <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-center">
                          {filtered.length} students · scroll to see all
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </>
          )}

          {selectedClass && records.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No students found in this class.
            </div>
          )}
          {!selectedClass && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              Select a class to take attendance.
            </div>
          )}
        </>
      )}

      {/* ── VIEW RECORDS ── */}
      {viewMode === 'view' && (
        <>
          {/* Sub-mode tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setViewSubMode('class')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${viewSubMode === 'class' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Class Overview
            </button>
            <button
              onClick={() => setViewSubMode('student')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${viewSubMode === 'student' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Student Detail
            </button>
          </div>

          {/* Class Overview */}
          {viewSubMode === 'class' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      value={viewClassId}
                      onChange={(e) => setViewClassId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={viewStartDate}
                      onChange={(e) => setViewStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={viewEndDate}
                      onChange={(e) => setViewEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {viewLoading && (
                    <div className="flex items-end">
                      <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                    </div>
                  )}
                </div>
              </div>

              {classRecords.length > 0 || classSummary.length > 0 ? (
                <>
                  {/* Inner tabs */}
                  <div className="flex gap-2 mb-4 border-b border-gray-200">
                    <button
                      onClick={() => setClassSummaryTab('daily')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${classSummaryTab === 'daily' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                      Daily Records ({classRecords.length})
                    </button>
                    <button
                      onClick={() => setClassSummaryTab('summary')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${classSummaryTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                      Student Summary ({classSummary.length})
                    </button>
                  </div>

                  {/* Daily Records */}
                  {classSummaryTab === 'daily' && (() => {
                    const totalPages = Math.ceil(classRecords.length / DAILY_PAGE_SIZE);
                    const pagedRecords = classRecords.slice((dailyPage - 1) * DAILY_PAGE_SIZE, dailyPage * DAILY_PAGE_SIZE);
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Pagination header */}
                        {classRecords.length > DAILY_PAGE_SIZE && (
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                            <span className="text-xs text-gray-500">
                              Showing {(dailyPage - 1) * DAILY_PAGE_SIZE + 1}–{Math.min(dailyPage * DAILY_PAGE_SIZE, classRecords.length)} of {classRecords.length} days
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                disabled={dailyPage === 1}
                                onClick={() => { setDailyPage(p => p - 1); setExpandedDate(null); }}
                                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              >← Prev</button>
                              <span className="px-2 text-xs text-gray-600">{dailyPage} / {totalPages}</span>
                              <button
                                disabled={dailyPage >= totalPages}
                                onClick={() => { setDailyPage(p => p + 1); setExpandedDate(null); }}
                                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              >Next →</button>
                            </div>
                          </div>
                        )}
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Present</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Absent</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Late</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Excused</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {pagedRecords.map((doc: any) => {
                              const recs = doc.records || [];
                              const total = viewStudents.length || recs.length;
                              const present = countByStatus(recs, 'present');
                              const late = countByStatus(recs, 'late');
                              const excused = countByStatus(recs, 'excused');
                              const absent = total - present - late - excused;
                              const rate = total > 0 ? Math.round((present / total) * 100) : 0;
                              const isExpanded = expandedDate === doc._id;

                              return (
                                  <tr
                                    key={doc._id}
                                    className={`hover:bg-blue-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-100' : ''}`}
                                    onClick={() => { setExpandedDate(isExpanded ? null : doc._id); setExpandedSearch(''); }}
                                  >
                                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{formatDate(doc.date)}</td>
                                    <td className="px-4 py-2.5 text-sm text-center text-gray-600">{total}</td>
                                    <td className="px-4 py-2.5 text-sm text-center font-semibold text-green-700">{present}</td>
                                    <td className="px-4 py-2.5 text-sm text-center font-semibold text-red-700">{absent}</td>
                                    <td className="px-4 py-2.5 text-sm text-center font-semibold text-yellow-700">{late}</td>
                                    <td className="px-4 py-2.5 text-sm text-center font-semibold text-blue-700">{excused}</td>
                                    <td className="px-4 py-2.5 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                          <div className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                                        </div>
                                        <span className={`text-xs font-semibold w-10 text-right ${rate >= 80 ? 'text-green-700' : rate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                                          {rate}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {/* Bottom pagination */}
                        {classRecords.length > DAILY_PAGE_SIZE && (
                          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                              <button
                                key={p}
                                onClick={() => { setDailyPage(p); setExpandedDate(null); }}
                                className={`w-7 h-7 text-xs rounded-full ${p === dailyPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Slide-out panel for date details */}
                  {expandedDate && (() => {
                    const doc = classRecords.find((d: any) => d._id === expandedDate);
                    if (!doc) return null;
                    const recs = doc.records || [];
                    const total = viewStudents.length || recs.length;
                    const present = countByStatus(recs, 'present');
                    const late = countByStatus(recs, 'late');
                    const excused = countByStatus(recs, 'excused');
                    const absent = total - present - late - excused;
                    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                    const recordMap = new Map(recs.map((r: any) => [r.student?._id || r.student, r]));
                    const allRecs = viewStudents.length > 0
                      ? viewStudents.map((s) => recordMap.get(s._id) || { student: s._id, status: 'absent', remark: '' })
                      : recs;
                    const filteredRecs = [...allRecs]
                      .sort((a: any, b: any) => {
                        const order: Record<string, number> = { absent: 0, late: 1, excused: 2, present: 3 };
                        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
                      })
                      .filter((r: any) => {
                        if (!expandedSearch) return true;
                        const sid = r.student?._id || r.student;
                        return getStudentName(sid).toLowerCase().includes(expandedSearch.toLowerCase());
                      });

                    return (
                      <>
                        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setExpandedDate(null)} />
                        <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col" style={{ animation: 'slideInRight 0.2s ease-out' }}>
                          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{formatDate(doc.date)}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">{total} students</p>
                            </div>
                            <button onClick={() => setExpandedDate(null)} className="text-gray-400 hover:text-gray-600 p-1">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-3 px-5 py-4 border-b border-gray-100">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{present}</div>
                              <div className="text-[10px] uppercase text-gray-500 font-medium">Present</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-600">{absent}</div>
                              <div className="text-[10px] uppercase text-gray-500 font-medium">Absent</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-600">{late}</div>
                              <div className="text-[10px] uppercase text-gray-500 font-medium">Late</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{excused}</div>
                              <div className="text-[10px] uppercase text-gray-500 font-medium">Excused</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${rate >= 80 ? 'text-green-700' : rate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>{rate}%</span>
                          </div>

                          <div className="px-5 py-3 border-b border-gray-100">
                            <input
                              type="text"
                              placeholder="Search student..."
                              value={expandedSearch}
                              onChange={(e) => setExpandedSearch(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="flex-1 overflow-y-auto">
                            {filteredRecs.map((r: any, i: number) => {
                              const sid = r.student?._id || r.student;
                              return (
                                <div key={i} className={`flex items-center justify-between px-5 py-3 border-b border-gray-50 ${
                                  r.status === 'present' ? 'bg-green-50/50' :
                                  r.status === 'absent' ? 'bg-red-50/50' :
                                  r.status === 'late' ? 'bg-yellow-50/50' :
                                  r.status === 'excused' ? 'bg-blue-50/50' : ''
                                }`}>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{getStudentName(sid)}</p>
                                    {r.remark && <p className="text-xs text-gray-400 mt-0.5">{r.remark}</p>}
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(r.status)}`}>{r.status}</span>
                                </div>
                              );
                            })}
                            {filteredRecs.length === 0 && (
                              <div className="px-5 py-8 text-center text-gray-400 text-sm">No students match</div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Student Summary */}
                  {classSummaryTab === 'summary' && (() => {
                    const filteredSummary = classSummary
                      .map((row: any) => {
                        const sid = row.student?._id || row._id;
                        const name = getStudentName(sid) || row.student?.admissionNo || 'Unknown';
                        const rate = row.total > 0 ? Math.round((row.present / row.total) * 100) : 0;
                        return { ...row, sid, name, rate };
                      })
                      .filter(row => !summarySearch || row.name.toLowerCase().includes(summarySearch.toLowerCase()))
                      .sort((a, b) => {
                        if (summarySort === 'rate-asc') return a.rate - b.rate;
                        if (summarySort === 'rate-desc') return b.rate - a.rate;
                        return a.name.localeCompare(b.name);
                      });

                    const atRisk = filteredSummary.filter(r => r.rate < 75).length;

                    return (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <input
                            type="text"
                            placeholder="Search student..."
                            value={summarySearch}
                            onChange={(e) => setSummarySearch(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 w-48"
                          />
                          <div className="flex gap-1 ml-auto">
                            {[
                              { val: 'rate-asc', label: 'Worst first' },
                              { val: 'rate-desc', label: 'Best first' },
                              { val: 'name', label: 'A–Z' },
                            ].map(opt => (
                              <button
                                key={opt.val}
                                onClick={() => setSummarySort(opt.val as any)}
                                className={`px-2.5 py-1 text-xs rounded-md border transition ${summarySort === opt.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{filteredSummary.length} students</span>
                          {atRisk > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{atRisk} at risk (&lt;75%)</span>
                          )}
                        </div>
                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)', minHeight: 200 }}>
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Days</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Present</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Absent</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Late</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Excused</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attendance Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredSummary.map((row: any, index) => (
                              <tr key={index} className={`${row.rate < 75 ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'} transition-colors`}>
                                <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
                                  {row.name}
                                  {row.rate < 75 && <span className="ml-2 text-xs text-red-500 font-normal">at risk</span>}
                                </td>
                                <td className="px-4 py-2.5 text-sm text-center text-gray-600">{row.total}</td>
                                <td className="px-4 py-2.5 text-sm text-center font-semibold text-green-700">{row.present}</td>
                                <td className="px-4 py-2.5 text-sm text-center font-semibold text-red-700">{row.absent}</td>
                                <td className="px-4 py-2.5 text-sm text-center font-semibold text-yellow-700">{row.late}</td>
                                <td className="px-4 py-2.5 text-sm text-center font-semibold text-blue-700">{row.excused}</td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                                      <div
                                        className={`h-2 rounded-full transition-all ${row.rate >= 80 ? 'bg-green-500' : row.rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${row.rate}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-semibold w-10 ${row.rate >= 80 ? 'text-green-700' : row.rate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                                      {row.rate}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {filteredSummary.length === 0 && (
                              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No students match your search</td></tr>
                            )}
                          </tbody>
                        </table>
                        </div>
                        {filteredSummary.length > 15 && (
                          <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-center">
                            {filteredSummary.length} students · scroll to see all
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : !viewLoading && viewClassId ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  No attendance records found. Click Load to fetch records.
                </div>
              ) : !viewClassId ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  Select a class and click Load to view attendance records.
                </div>
              ) : null}
            </>
          )}

          {/* Student Detail */}
          {viewSubMode === 'student' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      value={viewClassId}
                      onChange={(e) => { setViewClassId(e.target.value); setViewStudentId(''); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                      value={viewStudentId}
                      onChange={(e) => setViewStudentId(e.target.value)}
                      disabled={!viewClassId || viewStudents.length === 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Select Student</option>
                      {viewStudents.map((s) => {
                        const name = s.user && typeof s.user === 'object' ? `${s.user.firstName} ${s.user.lastName}` : s._id;
                        return <option key={s._id} value={s._id}>{name}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={viewStartDate}
                      onChange={(e) => setViewStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={viewEndDate}
                      onChange={(e) => setViewEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {viewLoading && (
                    <div className="flex items-end">
                      <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                    </div>
                  )}
                </div>
              </div>

              {viewStudentRecords.length > 0 && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{studentAttendanceSummary.total}</p>
                      <p className="text-xs text-gray-500">Total Days</p>
                    </div>
                    <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{studentAttendanceSummary.present}</p>
                      <p className="text-xs text-green-600">Present</p>
                    </div>
                    <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
                      <p className="text-2xl font-bold text-red-700">{studentAttendanceSummary.absent}</p>
                      <p className="text-xs text-red-600">Absent</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-700">{studentAttendanceSummary.late}</p>
                      <p className="text-xs text-yellow-600">Late</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{studentAttendanceSummary.excused}</p>
                      <p className="text-xs text-blue-600">Excused</p>
                    </div>
                    <div className={`rounded-lg border p-4 text-center ${studentAttendanceSummary.rate >= 80 ? 'bg-green-50 border-green-200' : studentAttendanceSummary.rate >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                      <p className={`text-2xl font-bold ${studentAttendanceSummary.rate >= 80 ? 'text-green-700' : studentAttendanceSummary.rate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {studentAttendanceSummary.rate}%
                      </p>
                      <p className="text-xs text-gray-500">Rate</p>
                    </div>
                  </div>

                  {/* Records table */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viewStudentRecords.map((doc: any, index) => {
                          const r = (doc.records as any[]).find(
                            r => r.student === viewStudentId || r.student?._id === viewStudentId
                          );
                          if (!r) return null;
                          return (
                            <tr key={doc._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(doc.date)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusBadge(r.status)}`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{r.remark || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {!viewLoading && viewStudentId && viewStudentRecords.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  No attendance records found for this student. Click Load to fetch.
                </div>
              )}

              {!viewStudentId && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  Select a class and student, then click Load to view attendance.
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
