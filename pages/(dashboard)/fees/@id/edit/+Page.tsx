import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { feeService, classService, sessionService } from '../../../../../lib/api-services'
import type { Fee, SchoolClass, Session } from '../../../../../lib/types'
import { useAppConfig } from '../../../../../lib/use-app-config'
import Card from '../../../../../components/ui/Card'
import Button from '../../../../../components/ui/Button'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

interface FeeBreakdown {
  item: string
  amount: number
}

interface TermFee {
  term: number
  amount: number
  breakdowns: FeeBreakdown[]
  dueDate: string
}

export default function EditFeePage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { termsPerSession, formatCurrency, currencySymbol } = useAppConfig()

  const [form, setForm] = useState({ classId: '', sessionId: '' })
  const [terms, setTerms] = useState<TermFee[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feeRes, classesRes, sessionsRes] = await Promise.all([
          feeService.getById(id),
          classService.getAll({ limit: 100 }),
          sessionService.getAll({ limit: 10 }),
        ])
        setClasses(classesRes.data || [])
        setSessions(sessionsRes.data || [])

        const fee = feeRes.data
        if (fee) {
          const classId = typeof fee.class === 'object' ? (fee.class as any)._id : fee.class
          const sessionId = typeof fee.session === 'object' ? (fee.session as any)._id : fee.session
          setForm({ classId: classId || '', sessionId: sessionId || '' })
          setTerms(
            fee.terms?.map((t) => ({
              term: t.term,
              amount: t.amount,
              breakdowns: t.breakdowns || [],
              dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
            })) || [{ term: 1, amount: 0, breakdowns: [], dueDate: '' }],
          )
        }
      } catch (err) {
        toast.error('Failed to load fee data')
      } finally {
        setDataLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const addTerm = () => {
    const usedTerms = terms.map((t) => t.term)
    const allTerms = Array.from({ length: termsPerSession }, (_, i) => i + 1)
    const availableTerms = allTerms.filter((t) => !usedTerms.includes(t))
    if (availableTerms.length === 0) {
      toast.error(`Maximum ${termsPerSession} terms allowed`)
      return
    }
    setTerms([...terms, { term: availableTerms[0], amount: 0, breakdowns: [], dueDate: '' }])
  }

  const removeTerm = (index: number) => {
    if (terms.length === 1) {
      toast.error('At least one term is required')
      return
    }
    setTerms(terms.filter((_, i) => i !== index))
  }

  const updateTerm = (index: number, key: keyof TermFee, value: any) => {
    const updated = [...terms]
    updated[index] = { ...updated[index], [key]: value }
    setTerms(updated)
  }

  const addBreakdown = (termIndex: number) => {
    const updated = [...terms]
    updated[termIndex].breakdowns.push({ item: '', amount: 0 })
    setTerms(updated)
  }

  const removeBreakdown = (termIndex: number, breakdownIndex: number) => {
    const updated = [...terms]
    updated[termIndex].breakdowns = updated[termIndex].breakdowns.filter((_, i) => i !== breakdownIndex)
    setTerms(updated)
  }

  const updateBreakdown = (termIndex: number, breakdownIndex: number, key: keyof FeeBreakdown, value: string | number) => {
    const updated = [...terms]
    updated[termIndex].breakdowns[breakdownIndex] = {
      ...updated[termIndex].breakdowns[breakdownIndex],
      [key]: value,
    }
    const totalAmount = updated[termIndex].breakdowns.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
    updated[termIndex].amount = totalAmount
    setTerms(updated)
  }

  const totalFees = terms.reduce((sum, t) => sum + (t.amount || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.classId || !form.sessionId) {
      toast.error('Please select class and session')
      return
    }

    if (terms.some((t) => t.amount <= 0)) {
      toast.error('Each term must have a fee amount greater than 0')
      return
    }

    setLoading(true)
    try {
      await feeService.update(id, {
        classId: form.classId,
        sessionId: form.sessionId,
        terms: terms.map((t) => ({
          term: t.term,
          amount: t.amount,
          breakdowns: t.breakdowns.length > 0 ? t.breakdowns.filter((b) => b.item && b.amount > 0) : undefined,
          dueDate: t.dueDate || undefined,
        })),
      })
      toast.success('Fee structure updated successfully')
      await navigate(`/fees/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update fee structure')
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Fees', href: '/fees' }, { label: 'Edit' }]} />
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Fees', href: '/fees' }, { label: 'Edit Fee Structure' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Fee Structure</h1>
          <p className="text-sm text-gray-500 mt-1">Update fee details for this class and session</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Basic Information</h3>

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
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Term Fees</h3>
                  {terms.length < termsPerSession && (
                    <Button type="button" variant="outline" onClick={addTerm}>
                      + Add Term
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {terms.map((term, termIndex) => (
                    <div key={termIndex} className="border rounded-xl p-5 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {term.term}
                          </span>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Term</label>
                            <select
                              value={term.term}
                              onChange={(e) => updateTerm(termIndex, 'term', parseInt(e.target.value))}
                              className="mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                              {Array.from({ length: termsPerSession }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Term {i + 1}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {terms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTerm(termIndex)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove Term
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                            <input
                              type="number"
                              value={term.amount || ''}
                              onChange={(e) => updateTerm(termIndex, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              min="0"
                              required
                            />
                          </div>
                          {term.breakdowns.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">Auto-calculated from breakdowns</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                          <input
                            type="date"
                            value={term.dueDate}
                            onChange={(e) => updateTerm(termIndex, 'dueDate', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Fee Breakdown (Optional)</label>
                          <button
                            type="button"
                            onClick={() => addBreakdown(termIndex)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            + Add Item
                          </button>
                        </div>

                        {term.breakdowns.length === 0 ? (
                          <p className="text-sm text-gray-500 italic py-2">No breakdown items. Click "Add Item" to itemize fees.</p>
                        ) : (
                          <div className="space-y-2">
                            {term.breakdowns.map((breakdown, breakdownIndex) => (
                              <div key={breakdownIndex} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={breakdown.item}
                                  onChange={(e) => updateBreakdown(termIndex, breakdownIndex, 'item', e.target.value)}
                                  placeholder="e.g. Tuition, Books, Uniform"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <div className="relative w-32">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currencySymbol}</span>
                                  <input
                                    type="number"
                                    value={breakdown.amount || ''}
                                    onChange={(e) => updateBreakdown(termIndex, breakdownIndex, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    min="0"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeBreakdown(termIndex, breakdownIndex)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" loading={loading} className="flex-1 sm:flex-none">
                  Update Fee Structure
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/fees/${id}`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Summary</h3>

            <div className="space-y-4">
              {form.classId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{classes.find((c) => c._id === form.classId)?.name || '-'}</span>
                </div>
              )}
              {form.sessionId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Session:</span>
                  <span className="font-medium">{sessions.find((s) => s._id === form.sessionId)?.name || '-'}</span>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                {terms.map((term) => (
                  <div key={term.term} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Term {term.term}</span>
                    <span className="font-medium">{formatCurrency(term.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Annual Fee</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(totalFees)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
