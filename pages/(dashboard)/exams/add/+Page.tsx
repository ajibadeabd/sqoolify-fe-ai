import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { examService, classService, subjectService, sessionService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import type { SchoolClass, Subject, Session } from '../../../../lib/types'

const EXAM_TYPES = [
  { value: 'CA1', label: 'CA 1', description: 'First Continuous Assessment', icon: '📝' },
  { value: 'CA2', label: 'CA 2', description: 'Second Continuous Assessment', icon: '📋' },
  { value: 'Exam', label: 'Examination', description: 'End of Term Examination', icon: '📄' },
]

const TERMS = [
  { value: 'First', label: 'First Term', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Second', label: 'Second Term', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'Third', label: 'Third Term', color: 'bg-purple-100 text-purple-700 border-purple-200' },
]

export default function AddExamPage() {
  const [form, setForm] = useState({
    name: '',
    type: 'CA1',
    class: '',
    subject: '',
    session: '',
    term: 'First',
    maxScore: 100,
    date: '',
  })
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, subjectsRes, sessionsRes] = await Promise.all([
          classService.getAll({ limit: 100 }),
          subjectService.getAll({ limit: 100 }),
          sessionService.getAll({ limit: 10 }),
        ])
        setClasses(classesRes.data || [])
        setSubjects(subjectsRes.data || [])
        setSessions(sessionsRes.data || [])

        // Auto-select current session
        const currentSession = sessionsRes.data?.find((s: Session) => s.isCurrent)
        if (currentSession) {
          setForm(prev => ({ ...prev, session: currentSession._id }))
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        toast.error('Failed to load data')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  const update = (key: string, value: string | number) => setForm({ ...form, [key]: value })

  // Auto-generate exam name based on selections
  const generateExamName = () => {
    const selectedClass = classes.find(c => c._id === form.class)
    const selectedSubject = subjects.find(s => s._id === form.subject)
    const selectedType = EXAM_TYPES.find(t => t.value === form.type)

    if (selectedSubject && selectedType) {
      const name = `${selectedSubject.name} ${selectedType.label}`
      setForm(prev => ({ ...prev, name }))
    }
  }

  useEffect(() => {
    if (form.subject && form.type && !form.name) {
      generateExamName()
    }
  }, [form.subject, form.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.class || !form.subject || !form.session) {
      toast.error('Please fill in all required fields')
      return
    }

    if (form.maxScore < 1) {
      toast.error('Max score must be at least 1')
      return
    }

    setLoading(true)

    try {
      await examService.create({
        name: form.name,
        type: form.type as any,
        class: form.class,
        subject: form.subject,
        session: form.session,
        term: form.term as any,
        maxScore: form.maxScore,
        date: form.date || undefined,
      })

      toast.success('Exam created successfully')
      await navigate('/exams')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  const selectedClass = classes.find(c => c._id === form.class)
  const selectedSubject = subjects.find(s => s._id === form.subject)
  const selectedSession = sessions.find(s => s._id === form.session)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Exams', href: '/exams' }, { label: 'Add Exam' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Exam</h1>
          <p className="text-sm text-gray-500 mt-1">Set up a new exam or assessment</p>
        </div>
      </div>

      {dataLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </Card>
      ) : (
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
                  <div className="flex gap-3">
                    {TERMS.map((term) => (
                      <button
                        key={term.value}
                        type="button"
                        onClick={() => update('term', term.value)}
                        className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all ${
                          form.term === term.value
                            ? `${term.color} border-current`
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
                          value={form.class}
                          onChange={(e) => update('class', e.target.value)}
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
                          value={form.subject}
                          onChange={(e) => update('subject', e.target.value)}
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
                          value={form.session}
                          onChange={(e) => update('session', e.target.value)}
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
                  <Button type="submit" loading={loading} className="flex-1 sm:flex-none">
                    Create Exam
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/exams')}>
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
                        TERMS.find(t => t.value === form.term)?.color || 'bg-gray-100'
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

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Next Steps</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• After creating, you can enter student scores</li>
                  <li>• Scores contribute to report card generation</li>
                  <li>• CA scores are typically weighted differently from exams</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
