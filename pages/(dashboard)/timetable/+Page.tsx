import { useState, useEffect, useCallback } from 'react';
import { timetableService, classService, sessionService } from '../../../lib/api-services';
import { SchoolClass, Session, TimetableEntry, PeriodConfig, PeriodSlot, Subject, Teacher, CreateTimetableEntryData } from '../../../lib/types';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import { usePermission } from '../../../lib/use-permission';
import { PERMISSIONS } from '../../../lib/permissions';
import { toast } from 'sonner';

interface CellData {
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room?: string;
  entryId?: string;
}

type TimetableGrid = Record<string, CellData>;

const NIGERIAN_DEFAULT_PERIODS: PeriodSlot[] = [
  { order: 1, label: 'Period 1', startTime: '08:00', endTime: '08:40', isBreak: false },
  { order: 2, label: 'Period 2', startTime: '08:40', endTime: '09:20', isBreak: false },
  { order: 3, label: 'Period 3', startTime: '09:20', endTime: '10:00', isBreak: false },
  { order: 4, label: 'Short Break', startTime: '10:00', endTime: '10:20', isBreak: true },
  { order: 5, label: 'Period 4', startTime: '10:20', endTime: '11:00', isBreak: false },
  { order: 6, label: 'Period 5', startTime: '11:00', endTime: '11:40', isBreak: false },
  { order: 7, label: 'Period 6', startTime: '11:40', endTime: '12:20', isBreak: false },
  { order: 8, label: 'Lunch Break', startTime: '12:20', endTime: '13:00', isBreak: true },
  { order: 9, label: 'Period 7', startTime: '13:00', endTime: '13:40', isBreak: false },
  { order: 10, label: 'Period 8', startTime: '13:40', endTime: '14:20', isBreak: false },
];

function getTeacherName(teacher: Teacher | string): string {
  if (typeof teacher === 'object' && teacher.user && typeof teacher.user === 'object') {
    return `${(teacher.user as any).firstName} ${(teacher.user as any).lastName}`;
  }
  return '';
}

export default function TimetablePage() {
  const { can, canWrite } = usePermission();
  const isEditable = canWrite('timetable');

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [periodConfig, setPeriodConfig] = useState<PeriodConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClassData, setSelectedClassData] = useState<SchoolClass | null>(null);

  const [grid, setGrid] = useState<TimetableGrid>({});

  // Period config editor state
  const [showPeriodConfig, setShowPeriodConfig] = useState(false);
  const [periodSlots, setPeriodSlots] = useState<PeriodSlot[]>([]);
  const [configDays, setConfigDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [savingConfig, setSavingConfig] = useState(false);

  // Cell editor state
  const [editingCell, setEditingCell] = useState<{ day: string; periodOrder: number } | null>(null);
  const [cellSubject, setCellSubject] = useState('');
  const [cellTeacher, setCellTeacher] = useState('');
  const [cellRoom, setCellRoom] = useState('');

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [classRes, sessionRes] = await Promise.all([
        classService.getAll({ limit: 100 }),
        sessionService.getAll({ limit: 10 }),
      ]);
      setClasses(classRes.data || []);
      setSessions(sessionRes.data || []);
      if ((sessionRes.data || []).length > 0 && !selectedSession) {
        const current = (sessionRes.data || []).find((s: Session) => s.isCurrent);
        setSelectedSession(current ? current._id : sessionRes.data[0]._id);
      }
      if ((classRes.data || []).length > 0 && !selectedClass) setSelectedClass(classRes.data[0]._id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPeriodConfig = useCallback(async () => {
    try {
      const res = await timetableService.getPeriodConfig(
        selectedSession ? { sessionId: selectedSession } : undefined,
      );
      if (res.data) {
        setPeriodConfig(res.data);
        setPeriodSlots(res.data.periods || []);
        setConfigDays(res.data.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      } else {
        setPeriodConfig(null);
        setPeriodSlots([]);
      }
    } catch {
      setPeriodConfig(null);
      setPeriodSlots([]);
    }
  }, [selectedSession]);

  const fetchClassTimetable = useCallback(async () => {
    if (!selectedClass) {
      setGrid({});
      return;
    }
    try {
      const [timetableRes, classRes] = await Promise.all([
        timetableService.getClassTimetable(selectedClass, selectedSession ? { sessionId: selectedSession } : undefined),
        classService.getById(selectedClass),
      ]);
      setSelectedClassData(classRes.data || null);

      const newGrid: TimetableGrid = {};
      (timetableRes.data || []).forEach((entry: TimetableEntry) => {
        const key = `${entry.day}-${entry.periodOrder}`;
        const subject = typeof entry.subject === 'object' ? entry.subject : null;
        const teacher = typeof entry.teacher === 'object' ? entry.teacher : null;
        newGrid[key] = {
          subjectId: subject?._id || (entry.subject as string),
          subjectName: subject?.name || '',
          teacherId: teacher?._id || (entry.teacher as string),
          teacherName: teacher ? getTeacherName(teacher) : '',
          room: entry.room,
          entryId: entry._id,
        };
      });
      setGrid(newGrid);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load timetable');
    }
  }, [selectedClass, selectedSession]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchPeriodConfig();
  }, [fetchPeriodConfig]);

  useEffect(() => {
    fetchClassTimetable();
  }, [fetchClassTimetable]);

  const handleCellClick = (day: string, periodOrder: number) => {
    if (!isEditable) return;
    const key = `${day}-${periodOrder}`;
    const existing = grid[key];
    setEditingCell({ day, periodOrder });
    setCellSubject(existing?.subjectId || '');
    setCellTeacher(existing?.teacherId || '');
    setCellRoom(existing?.room || '');
  };

  const handleCellSave = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.periodOrder}`;

    if (!cellSubject || !cellTeacher) {
      // Clear the cell
      const newGrid = { ...grid };
      delete newGrid[key];
      setGrid(newGrid);
    } else {
      const subject = getSubjectById(cellSubject);
      const teacher = getTeacherById(cellTeacher);
      setGrid({
        ...grid,
        [key]: {
          subjectId: cellSubject,
          subjectName: subject?.name || '',
          teacherId: cellTeacher,
          teacherName: teacher ? getTeacherName(teacher) : '',
          room: cellRoom || undefined,
        },
      });
    }
    setEditingCell(null);
  };

  const handleCellClear = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.periodOrder}`;
    const newGrid = { ...grid };
    delete newGrid[key];
    setGrid(newGrid);
    setEditingCell(null);
  };

  const getSubjectById = (id: string): Subject | null => {
    if (!selectedClassData?.subjects) return null;
    for (const s of selectedClassData.subjects) {
      const subj = typeof s.subject === 'object' ? s.subject : null;
      if (subj && subj._id === id) return subj;
    }
    return null;
  };

  const getTeacherById = (id: string): Teacher | null => {
    if (!selectedClassData?.subjects) return null;
    for (const s of selectedClassData.subjects) {
      for (const t of s.teachers) {
        const teacher = typeof t === 'object' ? t : null;
        if (teacher && teacher._id === id) return teacher;
      }
    }
    return null;
  };

  const getTeachersForSubject = (subjectId: string): Teacher[] => {
    if (!selectedClassData?.subjects) return [];
    const subjectEntry = selectedClassData.subjects.find(
      (s) => (typeof s.subject === 'object' ? s.subject._id : s.subject) === subjectId,
    );
    if (!subjectEntry) return [];
    return subjectEntry.teachers.filter((t) => typeof t === 'object') as Teacher[];
  };

  const handleSaveAll = async () => {
    if (!selectedClass || !selectedSession) {
      toast.error('Please select a class and session');
      return;
    }

    setSaving(true);
    try {
      const entries: CreateTimetableEntryData[] = Object.entries(grid).map(([key, cell]) => {
        const [day, periodOrder] = key.split('-');
        return {
          classId: selectedClass,
          subjectId: cell.subjectId,
          teacherId: cell.teacherId,
          day,
          periodOrder: parseInt(periodOrder),
          room: cell.room,
          sessionId: selectedSession,
        };
      });

      await timetableService.bulkSave({
        classId: selectedClass,
        sessionId: selectedSession,
        entries,
      });
      toast.success('Timetable saved successfully');
      fetchClassTimetable();
    } catch (err: any) {
      const conflicts = err?.response?.data?.conflicts || err?.conflicts;
      if (conflicts && Array.isArray(conflicts)) {
        conflicts.forEach((c: string) => toast.error(c));
      } else {
        toast.error(err.message || 'Failed to save timetable');
      }
    } finally {
      setSaving(false);
    }
  };

  // Period config handlers
  const handleAddPeriod = () => {
    const nextOrder = periodSlots.length > 0 ? Math.max(...periodSlots.map((p) => p.order)) + 1 : 1;
    setPeriodSlots([...periodSlots, { order: nextOrder, label: `Period ${nextOrder}`, startTime: '', endTime: '', isBreak: false }]);
  };

  const handleRemovePeriod = (index: number) => {
    setPeriodSlots(periodSlots.filter((_, i) => i !== index));
  };

  const handlePeriodChange = (index: number, field: keyof PeriodSlot, value: any) => {
    setPeriodSlots(periodSlots.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleSavePeriodConfig = async () => {
    const invalid = periodSlots.some((p) => !p.label || !p.startTime || !p.endTime);
    if (invalid) {
      toast.error('Please fill in the label, start time and end time for all periods');
      return;
    }
    if (periodSlots.length === 0) {
      toast.error('Please add at least one period');
      return;
    }
    setSavingConfig(true);
    try {
      await timetableService.savePeriodConfig({
        sessionId: selectedSession || undefined,
        periods: periodSlots,
        days: configDays,
      });
      toast.success('Period configuration saved');
      setShowPeriodConfig(false);
      fetchPeriodConfig();
    } catch (err: any) {
      toast.error('Failed to save period configuration. Please check all fields are filled correctly.');
    } finally {
      setSavingConfig(false);
    }
  };

  const days = periodConfig?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = periodConfig?.periods?.sort((a, b) => a.order - b.order) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Timetable' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage class schedules and period configurations</p>
        </div>
        <div className="flex gap-2">
          {isEditable && (
            <Button size="sm" variant="outline" onClick={() => setShowPeriodConfig(!showPeriodConfig)}>
              {showPeriodConfig ? 'Close Config' : 'Period Config'}
            </Button>
          )}
          {isEditable && selectedClass && selectedSession && (
            <Button size="sm" onClick={handleSaveAll} loading={saving}>
              Save Timetable
            </Button>
          )}
        </div>
      </div>

      {/* Selection Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Period Config Editor */}
      {showPeriodConfig && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Period Configuration</h2>
          <div className="space-y-3">
            {periodSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="number"
                  value={slot.order}
                  onChange={(e) => handlePeriodChange(index, 'order', parseInt(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="#"
                />
                <input
                  type="text"
                  value={slot.label}
                  onChange={(e) => handlePeriodChange(index, 'label', e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="Label"
                />
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <label className="flex items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={slot.isBreak}
                    onChange={(e) => handlePeriodChange(index, 'isBreak', e.target.checked)}
                  />
                  Break
                </label>
                <button onClick={() => handleRemovePeriod(index)} className="text-red-500 hover:text-red-700 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={handleAddPeriod}>
              Add Period
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPeriodSlots([...NIGERIAN_DEFAULT_PERIODS])}>
              Use Default Config
            </Button>
            <Button size="sm" onClick={handleSavePeriodConfig} loading={savingConfig}>
              Save Config
            </Button>
          </div>
        </div>
      )}

      {/* No period config warning */}
      {!periodConfig && !showPeriodConfig && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
          <p className="text-yellow-800 font-medium">No period configuration found</p>
          <p className="text-yellow-600 text-sm mt-1">Set up your school's period structure before creating timetables.</p>
          {isEditable && (
            <Button size="sm" className="mt-3" onClick={() => setShowPeriodConfig(true)}>
              Configure Periods
            </Button>
          )}
        </div>
      )}

      {/* Timetable Grid */}
      {periodConfig && selectedClass && periods.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-r border-gray-200 w-32">Time</th>
                {days.map((day) => (
                  <th key={day} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-r border-gray-200 last:border-r-0">
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.order} className={period.isBreak ? 'bg-amber-50/50' : 'hover:bg-gray-50/50'}>
                  <td className="px-3 py-2 border-b border-r border-gray-200 bg-gray-50/50">
                    <div className="text-xs font-semibold text-gray-700">{period.label}</div>
                    <div className="text-[11px] text-gray-400">{period.startTime} - {period.endTime}</div>
                  </td>
                  {period.isBreak ? (
                    <td colSpan={days.length} className="px-3 py-2 text-center text-xs text-amber-600 font-medium border-b border-gray-200">
                      {period.label}
                    </td>
                  ) : (
                    days.map((day) => {
                      const key = `${day}-${period.order}`;
                      const cell = grid[key];
                      const isActive = editingCell?.day === day && editingCell?.periodOrder === period.order;
                      return (
                        <td
                          key={day}
                          onClick={() => handleCellClick(day, period.order)}
                          className={`px-2 py-1.5 text-center border-b border-r border-gray-200 last:border-r-0 transition-colors ${
                            isEditable ? 'cursor-pointer hover:bg-blue-50' : ''
                          } ${isActive ? 'bg-blue-50 ring-1 ring-inset ring-blue-400' : ''}`}
                        >
                          {cell ? (
                            <div className="min-h-[36px] flex flex-col justify-center">
                              <div className="text-xs font-semibold text-gray-800 leading-tight">{cell.subjectName}</div>
                              <div className="text-[11px] text-gray-400 leading-tight">{cell.teacherName}</div>
                              {cell.room && <div className="text-[10px] text-gray-300">{cell.room}</div>}
                            </div>
                          ) : (
                            <div className="min-h-[36px] flex items-center justify-center">
                              <span className="text-gray-200 text-sm">+</span>
                            </div>
                          )}
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

      {/* Cell Editor Modal */}
      {editingCell && selectedClassData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingCell(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCell.day} — Period {editingCell.periodOrder}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={cellSubject}
                  onChange={(e) => {
                    setCellSubject(e.target.value);
                    setCellTeacher('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Subject</option>
                  {selectedClassData.subjects?.map((s) => {
                    const subj = typeof s.subject === 'object' ? s.subject : null;
                    if (!subj) return null;
                    return (
                      <option key={subj._id} value={subj._id}>{subj.name}</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={cellTeacher}
                  onChange={(e) => setCellTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!cellSubject}
                >
                  <option value="">Select Teacher</option>
                  {cellSubject && getTeachersForSubject(cellSubject).map((t) => (
                    <option key={t._id} value={t._id}>{getTeacherName(t)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room (optional)</label>
                <input
                  type="text"
                  value={cellRoom}
                  onChange={(e) => setCellRoom(e.target.value)}
                  placeholder="e.g. Lab 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={handleCellClear}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingCell(null)}>Cancel</Button>
                <Button size="sm" onClick={handleCellSave}>Apply</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedClass && periodConfig && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Select a class to view or edit its timetable.
        </div>
      )}
    </div>
  );
}
