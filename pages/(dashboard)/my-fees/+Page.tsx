import { useState, useEffect, useCallback } from 'react'
import { feeService, paymentService, dashboardService, studentService } from '../../../lib/api-services'
import { Payment, ParentDashboardStats } from '../../../lib/types'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Pagination from '../../../components/ui/Pagination'
import { usePermission } from '../../../lib/use-permission'
import { useAuth } from '../../../lib/auth-context'
import PaymentModal from '../../../components/fees/PaymentModal'

export default function MyFeesPage() {
  const { can } = usePermission()
  const { user } = useAuth()
  const isStudent = user?.schools?.[0]?.roles?.includes('student')
  const [, setChildren] = useState<any[]>([])
  const [studentFees, setStudentFees] = useState<any[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<{ totalFees: number; totalPaid: number; totalPendingFees: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [error, setError] = useState('')
  const [payPage, setPayPage] = useState(1)
  const [payTotalPages, setPayTotalPages] = useState(1)
  const [payTotal, setPayTotal] = useState(0)

  // Pay modal state
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<any>(null)
  const [paying, setPaying] = useState(false)
  const [payingTerm, setPayingTerm] = useState<number | null>(null)
  const [payError, setPayError] = useState('')

  const [tab, setTab] = useState<'fees' | 'history'>('fees')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all')

  const fetchFees = useCallback(async () => {
    setLoading(true)
    try {
      if (isStudent) {
        // Student: fetch own fees directly
        const feesRes = await studentService.getMyFees()
        const fees = feesRes.data || []
        setStudentFees(fees)
        const totalFees = fees.reduce((sum: number, sf: any) => sum + (sf.feeTotal || 0), 0)
        const totalPaid = fees.reduce((sum: number, sf: any) => sum + (sf.amountPaid || 0), 0)
        setStats({ totalFees, totalPaid, totalPendingFees: totalFees - totalPaid })
      } else {
        // Parent: fetch children fees + dashboard stats
        const [feesRes, statsRes] = await Promise.all([
          feeService.getMyChildrenFees(),
          dashboardService.getStats(),
        ])
        setChildren(feesRes.data?.children || [])
        setStudentFees(feesRes.data?.studentFees || [])
        const s = statsRes.data as ParentDashboardStats
        setStats({ totalFees: s.totalFees || 0, totalPaid: s.totalPaid || 0, totalPendingFees: s.totalPendingFees || 0 })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load fees')
    } finally {
      setLoading(false)
    }
  }, [isStudent])

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true)
    try {
      const res = await paymentService.getMyPayments({ page: payPage, limit: 10 })
      setPayments(res.data || [])
      setPayTotalPages(res.pagination?.totalPages || 1)
      setPayTotal(res.pagination?.total || 0)
    } catch {
      setPayments([])
    } finally {
      setPaymentsLoading(false)
    }
  }, [payPage])

  useEffect(() => { fetchFees() }, [fetchFees])
  useEffect(() => { if (!isStudent) fetchPayments() }, [fetchPayments, isStudent])

  const totalFees = stats?.totalFees || 0
  const totalPaid = stats?.totalPaid || 0
  const totalOutstanding = stats?.totalPendingFees || 0

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const openPayModal = (sf: any) => {
    setSelectedFee(sf)
    setPayError('')
    setPayModalOpen(true)
  }

  const handlePayTerm = async (term: number) => {
    if (!selectedFee) return
    setPaying(true)
    setPayingTerm(term)
    setPayError('')
    try {
      const res = await paymentService.initialize({
        studentFeeId: selectedFee._id,
        term,
      })
      if (res.data?.authorization_url) {
        window.location.href = res.data.authorization_url
      }
    } catch (err: any) {
      setPayError(err.message || 'Failed to initialize payment')
      setPaying(false)
      setPayingTerm(null)
    }
  }

  const handlePayAll = async () => {
    if (!selectedFee) return
    setPaying(true)
    setPayingTerm(null)
    setPayError('')
    try {
      const res = await paymentService.initialize({
        studentFeeId: selectedFee._id,
      })
      if (res.data?.authorization_url) {
        window.location.href = res.data.authorization_url
      }
    } catch (err: any) {
      setPayError(err.message || 'Failed to initialize payment')
      setPaying(false)
    }
  }

  // Filter and group fees by child
  const filteredFees = statusFilter === 'all'
    ? studentFees
    : studentFees.filter((sf: any) => sf.status === statusFilter)

  const feesByChild: Record<string, any[]> = {}
  for (const sf of filteredFees) {
    const studentId = sf.student?._id || sf.student?.toString?.() || 'unknown'
    if (!feesByChild[studentId]) feesByChild[studentId] = []
    feesByChild[studentId].push(sf)
  }

  const statusCounts = {
    all: studentFees.length,
    unpaid: studentFees.filter((sf: any) => sf.status === 'unpaid').length,
    partial: studentFees.filter((sf: any) => sf.status === 'partial').length,
    paid: studentFees.filter((sf: any) => sf.status === 'paid').length,
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Fees' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Fees</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={fetchFees} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Fees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalFees)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Amount Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('fees')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === 'fees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Fee Breakdown
        </button>
        {can('view_payment_history') && (
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payment History
          </button>
        )}
      </div>

      {tab === 'fees' && (
        <>
          {/* Status filter pills */}
          {studentFees.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', 'unpaid', 'partial', 'paid'] as const).map((s) => {
                const colors: Record<string, string> = {
                  all: 'bg-gray-100 text-gray-700',
                  unpaid: 'bg-red-100 text-red-700',
                  partial: 'bg-yellow-100 text-yellow-700',
                  paid: 'bg-green-100 text-green-700',
                }
                const activeColors: Record<string, string> = {
                  all: 'bg-gray-800 text-white',
                  unpaid: 'bg-red-600 text-white',
                  partial: 'bg-yellow-600 text-white',
                  paid: 'bg-green-600 text-white',
                }
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                      statusFilter === s ? activeColors[s] : colors[s]
                    }`}
                  >
                    {s === 'all' ? 'All' : s} ({statusCounts[s]})
                  </button>
                )
              })}
            </div>
          )}

          {filteredFees.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-500">
                {studentFees.length === 0 ? 'No fees assigned yet' : 'No fees match the selected filter'}
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(feesByChild).map(([studentId, fees]) => {
                const child = fees[0]?.student
                const childUser = child?.user || {}
                const childName = `${childUser.firstName || ''} ${childUser.lastName || ''}`.trim() || 'Student'

                return (
                  <div key={studentId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-semibold text-gray-900">{childName}</h3>
                      {child?.admissionNo && (
                        <p className="text-xs text-gray-500 mt-0.5">Admission: {child.admissionNo}</p>
                      )}
                    </div>

                    <div className="divide-y divide-gray-100">
                      {fees.map((sf: any) => {
                        const fee = sf.fee || {}
                        const className = fee.class?.name || 'N/A'
                        const sessionName = fee.session?.name || ''
                        const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
                          paid: 'success',
                          partial: 'warning',
                          unpaid: 'danger',
                        }

                        return (
                          <div key={sf._id} className="px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {className} {sessionName ? `— ${sessionName}` : ''}
                                </p>
                                {fee.terms && fee.terms.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {fee.terms.length} term{fee.terms.length > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <Badge variant={statusVariants[sf.status] || 'default'}>
                                {sf.status}
                              </Badge>
                            </div>

                            {/* Term breakdown with items */}
                            {fee.terms && fee.terms.length > 0 && (
                              <div className="mb-3 space-y-2">
                                {fee.terms.map((term: any, idx: number) => {
                                  const termPaid = (sf.payments || [])
                                    .filter((p: any) => p.term === term.term)
                                    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                                  const isTermPaid = termPaid >= term.amount

                                  return (
                                    <div key={idx} className={`rounded-lg p-3 text-sm ${isTermPaid ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-900">Term {term.term}</span>
                                          {isTermPaid && <Badge variant="success">Paid</Badge>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                          {term.dueDate && (
                                            <span className="text-xs text-gray-400">Due: {formatDate(term.dueDate)}</span>
                                          )}
                                          <span className={`font-semibold ${isTermPaid ? 'text-green-600' : 'text-gray-900'}`}>{formatCurrency(term.amount)}</span>
                                        </div>
                                      </div>
                                      {term.breakdowns && term.breakdowns.length > 0 && (
                                        <div className="border-t border-gray-200 pt-2 mt-1 space-y-1">
                                          {term.breakdowns.map((item: any, bIdx: number) => (
                                            <div key={bIdx} className="flex justify-between text-gray-600">
                                              <span>{item.item}</span>
                                              <span>{formatCurrency(item.amount)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex gap-6">
                                <div>
                                  <span className="text-gray-500">Paid: </span>
                                  <span className="font-medium text-green-600">{formatCurrency(sf.amountPaid)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Balance: </span>
                                  <span className="font-medium text-red-600">{formatCurrency(sf.balance)}</span>
                                </div>
                              </div>

                              {sf.balance > 0 && can('make_payments') && (
                                <button
                                  onClick={() => openPayModal(sf)}
                                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {paymentsLoading ? (
            <div className="p-8 text-center text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payment history yet</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Student</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Amount</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Method</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Reference</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p: any) => {
                      const studentUser = p.student?.user || {}
                      const payStatusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
                        completed: 'success',
                        pending: 'warning',
                        failed: 'danger',
                      }
                      return (
                        <tr key={p._id}>
                          <td className="px-5 py-3">{formatDate(p.createdAt)}</td>
                          <td className="px-5 py-3">
                            {studentUser.firstName} {studentUser.lastName}
                          </td>
                          <td className="px-5 py-3 font-medium">{formatCurrency(p.amount)}</td>
                          <td className="px-5 py-3 capitalize">{p.paymentMethod || p.paymentType || '-'}</td>
                          <td className="px-5 py-3 font-mono text-xs">{p.reference || '-'}</td>
                          <td className="px-5 py-3">
                            <Badge variant={payStatusVariants[p.paymentStatus] || 'default'}>
                              {p.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100">
                <Pagination page={payPage} totalPages={payTotalPages} total={payTotal} onPageChange={setPayPage} />
              </div>
            </>
          )}
        </div>
      )}

      {payModalOpen && selectedFee && (
        <PaymentModal
          studentFee={selectedFee}
          paying={paying}
          payingTerm={payingTerm}
          error={payError}
          onPayTerm={handlePayTerm}
          onPayAll={handlePayAll}
          onClose={() => setPayModalOpen(false)}
        />
      )}
    </div>
  )
}
