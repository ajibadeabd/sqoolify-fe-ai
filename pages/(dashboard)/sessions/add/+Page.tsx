import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { sessionService } from '../../../../lib/api-services'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import { useAppConfig } from '../../../../lib/use-app-config'
import { getTermOptions, getTermColorByName } from '../../../../lib/term-utils'

interface TermForm {
  name: string
  startDate: string
  endDate: string
}

export default function AddSessionPage() {
  const { termsPerSession } = useAppConfig()
  const termOptions = getTermOptions(termsPerSession)

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  })
  const [terms, setTerms] = useState<TermForm[]>([])
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const addTerm = () => {
    const usedNames = terms.map((t) => t.name)
    const availableNames = termOptions.map((o) => o.value).filter((n) => !usedNames.includes(n))
    if (availableNames.length === 0) {
      toast.error(`Maximum ${termsPerSession} terms allowed`)
      return
    }
    setTerms([...terms, { name: availableNames[0], startDate: '', endDate: '' }])
  }

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index))
  }

  const updateTerm = (index: number, key: keyof TermForm, value: string) => {
    const updated = [...terms]
    updated[index] = { ...updated[index], [key]: value }
    setTerms(updated)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return null
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} weeks (${diffDays} days)`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error('End date must be after start date')
      return
    }

    // Validate term dates
    for (const term of terms) {
      if (new Date(term.endDate) <= new Date(term.startDate)) {
        toast.error(`${term.name} Term: End date must be after start date`)
        return
      }
    }

    setLoading(true)

    try {
      await sessionService.create({
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        terms: terms.length > 0 ? terms : undefined,
      })

      toast.success('Academic session created successfully')
      await navigate('/sessions')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sessions', href: '/sessions' }, { label: 'Add Session' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Academic Session</h1>
          <p className="text-sm text-gray-500 mt-1">Set up a new academic year with terms</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Session Information</h3>

                <div className="space-y-4">
                  <Input
                    label="Session Name *"
                    value={form.name}
                    onChange={(e) => update('name', (e.target as HTMLInputElement).value)}
                    placeholder="e.g. 2024/2025 Academic Session"
                    required
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => update('startDate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => update('endDate', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {form.startDate && form.endDate && (
                    <p className="text-sm text-gray-500">
                      Duration: <span className="font-medium">{calculateDuration(form.startDate, form.endDate)}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Academic Terms</h3>
                    <p className="text-sm text-gray-500">Define term dates for this session</p>
                  </div>
                  {terms.length < termsPerSession && (
                    <Button type="button" variant="outline" onClick={addTerm}>
                      + Add Term
                    </Button>
                  )}
                </div>

                {terms.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-1">No terms added</p>
                    <p className="text-sm text-gray-500 mb-4">Add up to {termsPerSession} terms for this academic session</p>
                    <Button type="button" variant="outline" onClick={addTerm}>
                      + Add First Term
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {terms.map((term, index) => {
                      const colors = getTermColorByName(term.name)
                      return (
                        <div key={index} className={`border-2 rounded-xl p-5 ${colors.border} ${colors.bg}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 ${colors.badge} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                                {index + 1}
                              </span>
                              <div>
                                <select
                                  value={term.name}
                                  onChange={(e) => updateTerm(index, 'name', e.target.value)}
                                  className={`font-semibold ${colors.text} bg-transparent border-0 focus:ring-0 text-lg cursor-pointer`}
                                >
                                  {termOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTerm(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={term.startDate}
                                onChange={(e) => updateTerm(index, 'startDate', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                              <input
                                type="date"
                                value={term.endDate}
                                onChange={(e) => updateTerm(index, 'endDate', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                required
                              />
                            </div>
                          </div>
                          {term.startDate && term.endDate && (
                            <p className="text-sm text-gray-600 mt-2">
                              Duration: {calculateDuration(term.startDate, term.endDate)}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" loading={loading} className="flex-1 sm:flex-none">
                  Create Session
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/sessions')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Preview</h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Session Name</p>
                <p className="font-semibold text-gray-900">{form.name || 'Not set'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Starts</p>
                  <p className="font-medium text-green-700 text-sm">{formatDate(form.startDate)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Ends</p>
                  <p className="font-medium text-red-700 text-sm">{formatDate(form.endDate)}</p>
                </div>
              </div>

              {terms.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Terms ({terms.length})</p>
                  <div className="space-y-2">
                    {terms.map((term, i) => {
                      const colors = getTermColorByName(term.name)
                      return (
                        <div key={i} className={`p-3 rounded-lg ${colors.bg}`}>
                          <p className={`font-medium ${colors.text}`}>{term.name} Term</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(term.startDate)} - {formatDate(term.endDate)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Tips</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Session name should follow your school's naming convention</li>
                <li>• Add terms to organize exams and report cards</li>
                <li>• Only one session can be marked as "current" at a time</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
