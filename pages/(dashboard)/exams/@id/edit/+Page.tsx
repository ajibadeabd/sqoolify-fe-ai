import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { examService, classService, subjectService, sessionService } from '../../../../../lib/api-services'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import type { SchoolClass, Subject, Session, ExamMode } from '../../../../../lib/types'
import { useAppConfig } from '../../../../../lib/use-app-config'
import { getTermOptions } from '../../../../../lib/term-utils'

const EXAM_MODES: { value: ExamMode; label: string; description: string; icon: string }[] = [
  { value: 'traditional', label: 'Traditional', description: 'Enter scores manually', icon: '📊' },
  { value: 'cbt', label: 'CBT', description: 'Online questions & auto-grading', icon: '💻' },
  { value: 'file-upload', label: 'File Upload', description: 'Upload question papers', icon: '📎' },
  { value: 'hybrid', label: 'Hybrid', description: 'Questions + file uploads', icon: '🔄' },
]

export default function EditExamPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { termsPerSession, examTypes } = useAppConfig()
  const termOptions = getTermOptions(termsPerSession)

  const [form, setForm] = useState({
    name: '',
    type: 'CA1',
    classId: '',
    subjectId: '',
    sessionId: '',
    term: 'First',
    maxScore: 100,
    date: '',
    examMode: 'traditional' as ExamMode,
    duration: 60,
    startTime: '',
    endTime: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [examRes, classesRes, subjectsRes, sessionsRes] = await Promise.all([
          examService.getById(id),
          classService.getAll({ limit: 100 }),
          subjectService.getAll({ limit: 100 }),
          sessionService.getAll({ limit: 10 }),
        ])
        setClasses(classesRes.data || [])
        setSubjects(subjectsRes.data || [])
        setSessions(sessionsRes.data || [])

        const exam = examRes.data
        const formatLocalDateTime = (dateStr?: string) => {
          if (!dateStr) return ''
          const d = new Date(dateStr)
          const pad = (n: number) => n.toString().padStart(2, '0')
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        }

        setForm({
          name: exam.name || '',
          type: exam.type || 'CA1',
          classId: typeof exam.class === 'object' ? exam.class?._id : exam.class || '',
          subjectId: typeof exam.subject === 'object' ? exam.subject?._id : exam.subject || '',
          sessionId: typeof exam.session === 'object' ? exam.session?._id : exam.session || '',
          term: exam.term || 'First',
          maxScore: exam.maxScore || 100,
          date: exam.date ? new Date(exam.date).toISOString().slice(0, 10) : '',
          examMode: exam.examMode || 'traditional',
          duration: exam.duration || 60,
          startTime: formatLocalDateTime(exam.startTime),
          endTime: formatLocalDateTime(exam.endTime),
        })
      } catch (err: any) {
        toast.error(err.message || 'Failed to load exam')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const update = (key: string, value: string | number) => setForm({ ...form, [key]: value })

  const isCbtMode = form.examMode === 'cbt' || form.examMode === 'hybrid'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.classId || !form.subjectId || !form.sessionId) {
      toast.error('Please fill in all required fields')
      return
    }

    if (form.maxScore < 1) {
      toast.error('Max score must be at least 1')
      return
    }

    setSaving(true)

    try {
      await examService.update(id, {
        name: form.name,
        type: form.type as any,
        classId: form.classId,
        subjectId: form.subjectId,
        sessionId: form.sessionId,
        term: form.term,
        maxScore: form.maxScore,
        date: form.date || undefined,
        examMode: form.examMode,
        duration: isCbtMode ? form.duration : undefined,
        startTime: isCbtMode && form.startTime ? form.startTime : undefined,
        endTime: isCbtMode && form.endTime ? form.endTime : undefined,
      })

      toast.success('Exam updated successfully')
      await navigate(`/exams/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update exam')
    } finally {
      setSaving(false)
    }
  }

  const selectedClass = classes.find(c => c._id === form.classId)
  const selectedSubject = subjects.find(s => s._id === form.subjectId)
  const selectedSession = sessions.find(s => s._id === form.sessionId)
  const selectedMode = EXAM_MODES.find(m => m.value === form.examMode)

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Exams', href: '/exams' }, { label: 'Loading...' }]} />
        <Card>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading exam...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Exams', href: '/exams' }, { label: form.name || 'Exam' }, { label: 'Edit' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Exam</h1>
          <p className="text-sm text-gray-500 mt-1">Update exam details</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Exam Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Exam Mode *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EXAM_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => update('examMode', mode.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        form.examMode === mode.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-xl mb-1 block">{mode.icon}</span>
                      <span className="font-semibold text-gray-900 block text-sm">{mode.label}</span>
                      <span className="text-xs text-gray-500">{mode.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Exam Type *</label>
                <div className="flex flex-wrap gap-3">
                  {examTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update('type', type)}
                      className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all ${
                        form.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Term *</label>
                <div className="flex gap-3 flex-wrap">
                  {termOptions.map((term) => (
                    <button
                      key={term.value}
                      type="button"
                      onClick={() => update('term', term.value)}
                      className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all ${
                        form.term === term.value
                          ? `${term.color.bg} ${term.color.text} ${term.color.border} border-current`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {term.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h3>

                <div className="space-y-4">
                  <Input
                    label="Exam Name *"
                    value={form.name}
                    onChange={(e) => update('name', (e.target as HTMLInputElement).value)}
                    placeholder="e.g. Mathematics CA 1"
                    required
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                      <select
                        value={form.classId}
                        onChange={(e) => update('classId', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="">Select class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <select
                        value={form.subjectId}
                        onChange={(e) => update('subjectId', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session *</label>
                      <select
                        value={form.sessionId}
                        onChange={(e) => update('sessionId', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="">Select session</option>
                        {sessions.map((session) => (
                          <option key={session._id} value={session._id}>
                            {session.name} {session.isCurrent && '(Current)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Score *</label>
                      <input
                        type="number"
                        value={form.maxScore}
                        onChange={(e) => update('maxScore', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        min={1}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Exam Date (Optional)"
                      type="date"
                      value={form.date}
                      onChange={(e) => update('date', (e.target as HTMLInputElement).value)}
                    />
                  </div>
                </div>
              </div>

              {/* CBT Settings */}
              {isCbtMode && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">CBT Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                      <input
                        type="number"
                        value={form.duration}
                        onChange={(e) => update('duration', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        min={1}
                        placeholder="e.g. 60"
                      />
                      <p className="text-xs text-gray-500 mt-1">How long students have to complete the exam</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available From (Optional)</label>
                        <input
                          type="datetime-local"
                          value={form.startTime}
                          onChange={(e) => update('startTime', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Until (Optional)</label>
                        <input
                          type="datetime-local"
                          value={form.endTime}
                          onChange={(e) => update('endTime', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" loading={saving} className="flex-1 sm:flex-none">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/exams/${id}`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Preview</h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <p className="font-semibold text-gray-900">{form.name || 'Exam Name'}</p>
                  <p className="text-xs text-gray-500">{form.type}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mode</span>
                    <span className="font-medium">{selectedMode?.icon} {selectedMode?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Class</span>
                    <span className="font-medium">{selectedClass?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subject</span>
                    <span className="font-medium">{selectedSubject?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session</span>
                    <span className="font-medium">{selectedSession?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Term</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      (() => {
                        const t = termOptions.find(t => t.value === form.term)
                        return t ? `${t.color.bg} ${t.color.text}` : 'bg-gray-100'
                      })()
                    }`}>
                      {form.term} Term
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Score</span>
                    <span className="font-bold text-blue-600">{form.maxScore}</span>
                  </div>
                  {isCbtMode && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{form.duration} min</span>
                    </div>
                  )}
                  {form.date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">{new Date(form.date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
