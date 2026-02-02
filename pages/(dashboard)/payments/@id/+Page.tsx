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

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'failed':
        return <Badge variant="error">Failed</Badge>
      case 'refunded':
        return <Badge variant="info">Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!payment) {
    return <div className="text-center py-12 text-gray-500">Payment not found</div>
  }

  const student = typeof payment.student === 'object' ? payment.student : null
  const studentUser = student && typeof (student as any).user === 'object' ? (student as any).user : null
  const session = typeof payment.session === 'object' ? payment.session : null

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: payment.reference || 'Payment Details' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/payments')}>Back</Button>
          {can('write_payments') && (
            <Button variant="primary" onClick={() => navigate(`/payments/${id}/edit`)}>Edit</Button>
          )}
        </div>
      </div>

      {/* Amount & Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            {getStatusBadge(payment.paymentStatus)}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <Card title="Payment Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Reference</label>
            <p className="font-mono font-medium">{payment.reference || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Category</label>
            <p className="font-medium capitalize">{payment.paymentCategory?.replace('_', ' ') || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Type</label>
            <p className="font-medium capitalize">{payment.paymentType?.replace('_', ' ') || '-'}</p>
          </div>
          {payment.paymentMethod && (
            <div>
              <label className="text-sm text-gray-500">Method</label>
              <p className="font-medium capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
            </div>
          )}
          {payment.term && (
            <div>
              <label className="text-sm text-gray-500">Term</label>
              <p className="font-medium">Term {payment.term}</p>
            </div>
          )}
          {session && (
            <div>
              <label className="text-sm text-gray-500">Session</label>
              <p className="font-medium">{(session as any).name}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Student Info */}
      {studentUser && (
        <Card title="Student">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p className="font-medium">{studentUser.firstName} {studentUser.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{studentUser.email}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Timestamps */}
      {payment.createdAt && (
        <Card title="Timestamps">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Created</label>
              <p className="font-medium">{formatDate(payment.createdAt)}</p>
            </div>
            {payment.updatedAt && (
              <div>
                <label className="text-sm text-gray-500">Last Updated</label>
                <p className="font-medium">{formatDate(payment.updatedAt)}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
