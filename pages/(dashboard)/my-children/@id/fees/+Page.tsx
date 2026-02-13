import { useState, useEffect, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { feeService, paymentService } from '../../../../../lib/api-services'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import Card from '../../../../../components/ui/Card'
import Badge from '../../../../../components/ui/Badge'
import { usePermission } from '../../../../../lib/use-permission'
import PaymentModal from '../../../../../components/fees/PaymentModal'

export default function ChildFeesPage() {
  const { can } = usePermission()
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

  const [child, setChild] = useState<any>(null)
  const [studentFees, setStudentFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pay modal state
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<any>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all')

  const fetchFees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await feeService.getChildFees(id)
      setChild(res.data?.child || null)
      setStudentFees(res.data?.studentFees || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load fees')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchFees()
  }, [fetchFees, id])

  const totalFees = studentFees.reduce((sum, sf) => sum + sf.amountPaid + sf.balance, 0)
  const totalPaid = studentFees.reduce((sum, sf) => sum + sf.amountPaid, 0)
  const totalOutstanding = studentFees.reduce((sum, sf) => sum + sf.balance, 0)

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

  const handlePay = async () => {
    if (!selectedFee) return
    setPaying(true)
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

  const filteredFees = statusFilter === 'all'
    ? studentFees
    : studentFees.filter((sf: any) => sf.status === statusFilter)

  const statusCounts = {
    all: studentFees.length,
    unpaid: studentFees.filter((sf: any) => sf.status === 'unpaid').length,
    partial: studentFees.filter((sf: any) => sf.status === 'partial').length,
    paid: studentFees.filter((sf: any) => sf.status === 'paid').length,
  }

  const childUser = child?.user || {}
  const childName = `${childUser.firstName || ''} ${childUser.lastName || ''}`.trim() || 'Child'

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
      <Breadcrumbs items={[
        { label: 'My Children', href: '/my-children' },
        { label: childName, href: `/my-children/${id}` },
        { label: 'Fees' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees — {childName}</h1>
          {child?.admissionNo && (
            <p className="text-sm text-gray-500 mt-1">Admission No: {child.admissionNo}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`/my-children/${id}`)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
        >
          Back
        </button>
      </div>

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
        <div className="space-y-4">
          {filteredFees.map((sf: any) => {
            const fee = sf.fee || {}
            const className = fee.class?.name || 'N/A'
            const sessionName = fee.session?.name || ''
            const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
              paid: 'success',
              partial: 'warning',
              unpaid: 'danger',
            }

            return (
              <div key={sf._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4">
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

                  {/* Term breakdown */}
                  {fee.terms && fee.terms.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {fee.terms.map((term: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">Term {term.term}</span>
                            <div className="flex items-center gap-3">
                              {term.dueDate && (
                                <span className="text-xs text-gray-400">Due: {formatDate(term.dueDate)}</span>
                              )}
                              <span className="font-semibold text-gray-900">{formatCurrency(term.amount)}</span>
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
                      ))}
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
              </div>
            )
          })}
        </div>
      )}

      {payModalOpen && selectedFee && (
        <PaymentModal
          studentFee={selectedFee}
          paying={paying}
          error={payError}
          onPay={handlePay}
          onClose={() => setPayModalOpen(false)}
        />
      )}
    </div>
  )
}