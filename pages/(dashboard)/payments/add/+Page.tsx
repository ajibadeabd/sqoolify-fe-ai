import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { paymentService, studentService, sessionService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import type { Student, Session } from '../../../../lib/types'
import { useAppConfig } from '../../../../lib/use-app-config'

export default function AddPaymentPage() {
  const { formatCurrency, termsPerSession, currencySymbol, paymentCategories, paymentTypes, paymentMethods: allPaymentMethods } = useAppConfig()
  const paymentMethods = allPaymentMethods.filter(m => m !== 'online')
  const [form, setForm] = useState({
    studentId: '',
    amount: 0,
    paymentType: '',
    paymentMethod: '',
    paymentCategory: '',
    sessionId: '',
    term: 1,
  })
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [studentSearch, setStudentSearch] = useState('')

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      paymentType: prev.paymentType || paymentTypes[0] || 'full',
      paymentMethod: prev.paymentMethod || paymentMethods[0] || 'cash',
      paymentCategory: prev.paymentCategory || paymentCategories[0] || 'tuition',
    }))
  }, [paymentTypes, paymentMethods, paymentCategories])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, sessionsRes] = await Promise.all([
          studentService.getAll({ limit: 100 }),
          sessionService.getAll({ limit: 10 }),
        ])
        setStudents(studentsRes.data || [])
        setSessions(sessionsRes.data || [])

        // Auto-select current session
        const currentSession = sessionsRes.data?.find((s: Session) => s.isCurrent)
        if (currentSession) {
          setForm(prev => ({ ...prev, sessionId: currentSession._id }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.studentId) {
      toast.error('Please select a student')
      return
    }

    if (form.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setLoading(true)

    try {
      await paymentService.create({
        studentId: form.studentId,
        amount: form.amount,
        paymentType: form.paymentType,
        paymentMethod: form.paymentMethod,
        paymentCategory: form.paymentCategory,
        sessionId: form.sessionId || undefined,
        term: form.term,
      })

      toast.success('Payment recorded successfully')
      await navigate('/payments')
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = studentSearch
    ? students.filter(s => {
        const u = typeof s.user === 'object' ? s.user : null; const name = u ? `${u.firstName} ${u.lastName}`.toLowerCase() : ''
        const admNo = (s.admissionNo || '').toLowerCase()
        return name.includes(studentSearch.toLowerCase()) || admNo.includes(studentSearch.toLowerCase())
      })
    : students

  const selectedStudent = students.find(s => s._id === form.studentId)
  const selectedSession = sessions.find(s => s._id === form.sessionId)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: 'Record Payment' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-sm text-gray-500 mt-1">Record a new fee payment for a student</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Student *</label>
                  <input
                    type="text"
                    placeholder="Search by name or admission number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredStudents.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No students found</p>
                    ) : (
                      filteredStudents.slice(0, 20).map((student) => {
                        const u = typeof student.user === 'object' ? student.user : null; const name = u ? `${u.firstName} ${u.lastName}` : 'Unknown'
                        return (
                          <button
                            key={student._id}
                            type="button"
                            onClick={() => {
                              update('studentId', student._id)
                              setStudentSearch('')
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors ${
                              form.studentId === student._id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div>
                              <p className="font-medium text-gray-900">{name}</p>
                              <p className="text-xs text-gray-500">{student.admissionNo || 'No Adm No'}</p>
                            </div>
                            {form.studentId === student._id && (
                              <span className="text-blue-600 text-sm">Selected</span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{currencySymbol}</span>
                        <input
                          type="number"
                          value={form.amount || ''}
                          onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-semibold"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Category</label>
                      <select
                        value={form.paymentCategory}
                        onChange={(e) => update('paymentCategory', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {paymentCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {paymentTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => update('paymentType', type)}
                          className={`px-4 py-2.5 rounded-lg border-2 transition-all ${
                            form.paymentType === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className="text-sm font-medium capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method *</label>
                    <div className="flex flex-wrap gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => update('paymentMethod', method)}
                          className={`px-4 py-2.5 rounded-lg border-2 transition-all ${
                            form.paymentMethod === method
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className="text-sm font-medium capitalize">{method.replace('_', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                      <select
                        value={form.term}
                        onChange={(e) => update('term', parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {Array.from({ length: termsPerSession }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Term {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
                    <select
                      value={form.sessionId}
                      onChange={(e) => update('sessionId', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select session</option>
                      {sessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.name} {session.isCurrent && '(Current)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" loading={loading} className="flex-1 sm:flex-none">
                    Record Payment
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/payments')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>

              <div className="space-y-4">
                {selectedStudent && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Student</p>
                    <p className="font-semibold text-gray-900">
                      {typeof selectedStudent.user === 'object' ? `${selectedStudent.user.firstName} ${selectedStudent.user.lastName}` : 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">{selectedStudent.admissionNo || 'No Adm No'}</p>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-xl text-green-600">{formatCurrency(form.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium capitalize">{form.paymentCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium capitalize">{form.paymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium capitalize">{form.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Term</span>
                    <span className="font-medium">Term {form.term}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Important</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Verify payment details before recording</li>
                  <li>• Payments cannot be deleted once recorded</li>
                  <li>• Issue receipt to student/parent after payment</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
