import { useState, useEffect, useCallback } from 'react';
import { attendanceService, classService, studentService, sessionService } from '../../../lib/api-services';
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
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // View mode
  const [viewMode, setViewMode] = useState<'take' | 'view'>('take');

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
      // Extract students from the class object
      const studentList = (res.data as any)?.students || [];
      setStudents(studentList);
      // Initialize records with present status
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
        // Update records with existing data
        setRecords(prev => prev.map(r => {
          const existingRecord = existing.records.find(
            (er: any) => er.student === r.studentId || er.student?._id === r.studentId
          );
          if (existingRecord) {
            return {
              ...r,
              status: existingRecord.status,
              remark: existingRecord.remark || '',
            };
          }
          return r;
        }));
      }
    } catch {
      // No existing attendance
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (records.length > 0) {
      fetchExistingAttendance();
    }
  }, [selectedDate, records.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => prev.map(r =>
      r.studentId === studentId ? { ...r, status } : r
    ));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRecords(prev => prev.map(r =>
      r.studentId === studentId ? { ...r, remark } : r
    ));
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

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-300';
      case 'absent': return 'bg-red-100 text-red-700 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'excused': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Selection Controls */}
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

      {/* Stats */}
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

      {/* Quick Actions */}
      {records.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => markAllAs('present')}
            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAllAs('absent')}
            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Mark All Absent
          </button>
        </div>
      )}

      {/* Attendance Table */}
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
    </div>
  );
}
