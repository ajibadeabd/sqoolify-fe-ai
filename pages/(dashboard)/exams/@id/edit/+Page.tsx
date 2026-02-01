import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { examService, classService, subjectService, sessionService } from '../../../../../lib/api-services'
import Input from '../../../../../components/ui/Input'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import type { SchoolClass, Subject, Session } from '../../../../../lib/types'
import { useAppConfig } from '../../../../../lib/use-app-config'
import { getTermOptions } from '../../../../../lib/term-utils'

const EXAM_TYPES = [
  { value: 'CA1', label: 'CA 1', description: 'First Continuous Assessment', icon: '📝' },
  { value: 'CA2', label: 'CA 2', description: 'Second Continuous Assessment', icon: '📋' },
  { value: 'Exam', label: 'Examination', description: 'End of Term Examination', icon: '📄' },
]

export default function EditExamPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { termsPerSession } = useAppConfig()
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
        setForm({
          name: exam.name || '',
          type: exam.type || 'CA1',
          classId: typeof exam.class === 'object' ? exam.class?._id : exam.class || '',
          subjectId: typeof exam.subject === 'object' ? exam.subject?._id : exam.subject || '',
          sessionId: typeof exam.session === 'object' ? exam.session?._id : exam.session || '',
          term: exam.term || 'First',
          maxScore: exam.maxScore || 100,
          date: exam.date ? new Date(exam.date).toISOString().slice(0, 10) : '',
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Exam</h1>
          <p className="text-sm text-gray-500 mt-1">Update exam details</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Exam Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {EXAM_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => update('type', type.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        form.type === type.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{type.icon}</span>
                      <span className="font-semibold text-gray-900 block">{type.label}</span>
                      <span className="text-xs text-gray-500">{type.description}</span>
                    </button>
                  ))}
                </div>
              </div>

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
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{EXAM_TYPES.find(t => t.value === form.type)?.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{form.name || 'Exam Name'}</p>
                    <p className="text-xs text-gray-500">{EXAM_TYPES.find(t => t.value === form.type)?.label}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
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
