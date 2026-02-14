import { useState, useEffect } from 'react';
import { subjectService, sessionService, timetableService } from '../../lib/api-services';
import { Session, AdminDashboardStats } from '../../lib/types';

interface Step {
  label: string;
  href: string;
  done: boolean;
}

interface OnboardingChecklistProps {
  stats: AdminDashboardStats;
  currentSession: Session | null;
}

export default function OnboardingChecklist({ stats, currentSession }: OnboardingChecklistProps) {
  const [subjectCount, setSubjectCount] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [hasTimetable, setHasTimetable] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    Promise.all([
      subjectService.getAll({ limit: 1 }).then((res) => setSubjectCount((res.data || []).length)).catch(() => setSubjectCount(0)),
      sessionService.getAll({ limit: 1 }).then((res) => setSessionCount((res.data || []).length)).catch(() => setSessionCount(0)),
      timetableService.getPeriodConfig().then((res) => setHasTimetable(!!res.data)).catch(() => setHasTimetable(false)),
    ]);
  }, []);

  if (dismissed || subjectCount === null || sessionCount === null || hasTimetable === null) return null;

  const steps: Step[] = [
    { label: 'Create a session', href: '/sessions', done: !!currentSession },
    { label: 'Add subjects', href: '/subjects', done: subjectCount > 0 },
    { label: 'Create classes', href: '/classes', done: (stats?.totalClasses || 0) > 0 },
    { label: 'Add teachers', href: '/teachers', done: (stats?.totalTeachers || 0) > 0 },
    { label: 'Add students', href: '/students', done: (stats?.totalStudents || 0) > 0 },
    { label: 'Set up timetable', href: '/timetable', done: hasTimetable },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;

  if (completed === total) return null;

  const progress = Math.round((completed / total) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Getting Started</h3>
          <p className="text-xs text-gray-500 mt-0.5">{completed}/{total} steps completed</p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 text-xs">
          Dismiss
        </button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <a
            key={i}
            href={step.done ? undefined : step.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              step.done
                ? 'text-gray-400 line-through'
                : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {step.done ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <span className="text-xs font-medium">{i + 1}</span>
              )}
            </span>
            <span>{step.label}</span>
            {!step.done && (
              <svg className="w-4 h-4 ml-auto text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
