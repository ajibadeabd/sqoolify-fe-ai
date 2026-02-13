import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { paymentService } from '../../../../lib/api-services'
import { Payment } from '../../../../lib/types'
import { useAppConfig } from '../../../../lib/use-app-config'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import { usePermission } from '../../../../lib/use-permission'

export default function PaymentDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const { formatCurrency } = useAppConfig()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [reverifying, setReverifying] = useState(false)
  const [reverifyError, setReverifyError] = useState('')

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await paymentService.getById(id)
        setPayment(res.data)
      } catch {
        setPayment(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchPayment()
  }, [id])

  const handleReverify = async () => {
    if (!payment?.reference) return
    setReverifying(true)
    setReverifyError('')
    try {
      const res = await paymentService.reverify(payment.reference)
      if (res.data?.status === 'completed') {
        const updated = await paymentService.getById(id)
        setPayment(updated.data)
      } else {
        setReverifyError('Payment was not completed on the payment gateway')
      }
    } catch (err: any) {
      setReverifyError(err.message || 'Failed to re-verify payment')
    } finally {
      setReverifying(false)
    }
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { variant: 'success' as const, label: 'Completed', bg: 'from-green-500 to-emerald-600', iconBg: 'bg-green-400/30' }
      case 'pending':
        return { variant: 'warning' as const, label: 'Pending', bg: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-400/30' }
      case 'failed':
        return { variant: 'danger' as const, label: 'Failed', bg: 'from-red-500 to-rose-600', iconBg: 'bg-red-400/30' }
      case 'refunded':
        return { variant: 'info' as const, label: 'Refunded', bg: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-400/30' }
      default:
        return { variant: undefined, label: status, bg: 'from-gray-500 to-gray-600', iconBg: 'bg-gray-400/30' }
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (!payment) {
    return <div className="text-center py-12 text-gray-500">Payment not found</div>
  }

  const student = typeof payment.student === 'object' ? payment.student : null
  const studentUser = student && typeof (student as any).user === 'object' ? (student as any).user : null
  const session = typeof payment.session === 'object' ? payment.session : null
  const studentFee = typeof payment.studentFee === 'object' ? payment.studentFee as any : null
  const feeDoc = studentFee && typeof studentFee.fee === 'object' ? studentFee.fee : null
  const feeClass = feeDoc && typeof feeDoc.class === 'object' ? feeDoc.class : null
  const statusConfig = getStatusConfig(payment.paymentStatus)

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: payment.reference || 'Payment Details' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/payments')}>Back</Button>
          {can('write_payments') && payment.paymentStatus === 'pending' && payment.reference && (
            <Button
              variant="outline"
              onClick={handleReverify}
              disabled={reverifying}
            >
              {reverifying ? 'Verifying...' : 'Re-verify'}
            </Button>
          )}
        </div>
      </div>

      {reverifyError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {reverifyError}
        </div>
      )}

      {/* Amount & Status Hero Card */}
      <div className={`bg-gradient-to-r ${statusConfig.bg} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70 mb-1">Amount</p>
            <p className="text-3xl font-bold">{formatCurrency(payment.amount)}</p>
            {payment.reference && (
              <p className="text-sm text-white/60 mt-2 font-mono">{payment.reference}</p>
            )}
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.iconBg}`}>
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="font-semibold text-sm">{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-600 mb-1">Category</p>
          <p className="font-medium text-blue-700 text-sm capitalize">{payment.paymentCategory?.replace('_', ' ') || '-'}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-xs text-purple-600 mb-1">Type</p>
          <p className="font-medium text-purple-700 text-sm capitalize">{payment.paymentType?.replace('_', ' ') || '-'}</p>
        </div>
        {payment.paymentMethod && (
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-600 mb-1">Method</p>
            <p className="font-medium text-indigo-700 text-sm capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
          </div>
        )}
        {payment.term && (
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-xs text-orange-600 mb-1">Term</p>
            <p className="font-medium text-orange-700 text-sm">Term {payment.term}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info */}
          <Card title="Payment Information">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Reference</label>
                <p className="font-mono font-medium text-gray-900">{payment.reference || '-'}</p>
              </div>
              {session && (
                <div>
                  <label className="text-sm text-gray-500">Session</label>
                  <p className="font-medium text-gray-900">{(session as any).name}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">Created</label>
                <p className="font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
              </div>
              {payment.updatedAt && (
                <div>
                  <label className="text-sm text-gray-500">Last Updated</label>
                  <p className="font-medium text-gray-900">{formatDate(payment.updatedAt)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Fee Details */}
          {feeDoc && (
            <Card title="Fee Details">
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Fee Name</p>
                  <p className="font-medium text-gray-900 text-sm">{feeDoc.name || '-'}</p>
                </div>
                {feeDoc.terms && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Total Fee</p>
                    <p className="font-medium text-blue-700 text-sm">
                      {formatCurrency(feeDoc.terms.reduce((sum: number, t: any) => sum + (t.amount || 0), 0))}
                    </p>
                  </div>
                )}
                {studentFee.payments && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Total Paid</p>
                    <p className="font-medium text-green-700 text-sm">
                      {formatCurrency(studentFee.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0))}
                    </p>
                  </div>
                )}
              </div>
              {feeDoc.terms && feeDoc.terms.length > 0 && (
                <div className="border-t pt-4">
                  <label className="text-sm text-gray-500 mb-3 block">Term Breakdown</label>
                  <div className="space-y-2">
                    {feeDoc.terms.map((term: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-sm">
                        <span className="text-gray-600">
                          Term {term.term || i + 1}
                          {term.dueDate && <span className="text-gray-400 ml-2">(due {formatDate(term.dueDate)})</span>}
                        </span>
                        <span className="font-semibold text-gray-900">{formatCurrency(term.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Student Card */}
          {studentUser && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Student</h3>
              <div className="space-y-3">
                <div className="p-3 bg-sky-50 rounded-lg">
                  <p className="text-xs text-sky-600 mb-1">Name</p>
                  <p className="font-medium text-sky-700 text-sm">{studentUser.firstName} {studentUser.lastName}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">Email</p>
                  <p className="font-medium text-purple-700 text-sm truncate">{studentUser.email}</p>
                </div>
                {feeClass && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-600 mb-1">Class</p>
                    <p className="font-medium text-indigo-700 text-sm">{feeClass.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Card */}
          {session && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Session</h3>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-600 mb-1">Academic Session</p>
                <p className="font-medium text-amber-700 text-sm">{(session as any).name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
