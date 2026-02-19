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
          return r;
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{stats.present}</p>
                <p className="text-sm text-green-600">Present</p>
              </div>
              <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
                <p className="text-sm text-red-600">Absent</p>
              </div>
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
                <p className="text-sm text-yellow-600">Late</p>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{stats.excused}</p>
                <p className="text-sm text-blue-600">Excused</p>
              </div>
            </div>
          )}

          {records.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => markAllAs('present')} className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                Mark All Present
              </button>
              <button onClick={() => markAllAs('absent')} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Mark All Absent
              </button>
            </div>
          )}

          {selectedClass && records.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record, index) => (
                    <tr key={record.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.studentName}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(record.studentId, status)}
                              className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors ${
                                record.status === status
                                  ? getStatusColor(status)
                                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={record.remark || ''}
                          onChange={(e) => handleRemarkChange(record.studentId, e.target.value)}
                          placeholder="Optional remark..."
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedClass ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No students found in this class.
            </div>
          ) : (
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
                  <div className="flex items-end">
                    <Button onClick={fetchClassView} loading={viewLoading} disabled={!viewClassId}>
                      Load
                    </Button>
                  </div>
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
                  {classSummaryTab === 'daily' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {classRecords.map((doc: any, index) => {
                            const recs = doc.records || [];
                            const total = recs.length;
                            const present = countByStatus(recs, 'present');
                            const absent = countByStatus(recs, 'absent');
                            const late = countByStatus(recs, 'late');
                            const excused = countByStatus(recs, 'excused');
                            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
                            const dateKey = doc._id;
                            const isExpanded = expandedDate === dateKey;

                            return (
                              <>
                                <tr key={doc._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatDate(doc.date)}</td>
                                  <td className="px-4 py-3 text-sm text-center text-gray-700">{total}</td>
                                  <td className="px-4 py-3 text-sm text-center font-medium text-green-700">{present}</td>
                                  <td className="px-4 py-3 text-sm text-center font-medium text-red-700">{absent}</td>
                                  <td className="px-4 py-3 text-sm text-center font-medium text-yellow-700">{late}</td>
                                  <td className="px-4 py-3 text-sm text-center font-medium text-blue-700">{excused}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rate >= 80 ? 'bg-green-100 text-green-700' : rate >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {rate}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => setExpandedDate(isExpanded ? null : dateKey)}
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      {isExpanded ? 'Hide' : 'Details'}
                                    </button>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr key={`${doc._id}-expanded`}>
                                    <td colSpan={8} className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {recs.map((r: any, i: number) => {
                                          const sid = r.student?._id || r.student;
                                          const name = getStudentName(sid);
                                          return (
                                            <div key={i} className="flex items-center gap-2">
                                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusBadge(r.status)}`}>{r.status}</span>
                                              <span className="text-xs text-gray-700 truncate">{name}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Student Summary */}
                  {classSummaryTab === 'summary' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total Days</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Present</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Absent</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Late</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Excused</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {classSummary.map((row: any, index) => {
                            const sid = row.student?._id || row._id;
                            const name = getStudentName(sid) || row.student?.admissionNo || 'Unknown';
                            const rate = row.total > 0 ? Math.round((row.present / row.total) * 100) : 0;
                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{row.total}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-green-700">{row.present}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-red-700">{row.absent}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-yellow-700">{row.late}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-blue-700">{row.excused}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rate >= 80 ? 'bg-green-100 text-green-700' : rate >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {rate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                  <div className="flex items-end">
                    <Button onClick={fetchStudentView} loading={viewLoading} disabled={!viewStudentId}>
                      Load
                    </Button>
                  </div>
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
