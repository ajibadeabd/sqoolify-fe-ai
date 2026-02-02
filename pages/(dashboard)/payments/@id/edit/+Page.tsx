import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { paymentService } from '../../../../../lib/api-services'
import { Payment } from '../../../../../lib/types'
import { useAppConfig } from '../../../../../lib/use-app-config'
import Card from '../../../../../components/ui/Card'
import Button from '../../../../../components/ui/Button'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function EditPaymentPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { currencySymbol } = useAppConfig()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    amount: 0,
    paymentCategory: '',
    paymentType: '',
    paymentMethod: '',
    paymentStatus: '',
    reference: '',
    term: '',
  })

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await paymentService.getById(id)
        const p = res.data
        if (p) {
          setForm({
            amount: p.amount || 0,
            paymentCategory: p.paymentCategory || '',
            paymentType: p.paymentType || '',
            paymentMethod: p.paymentMethod || '',
            paymentStatus: p.paymentStatus || '',
            reference: p.reference || '',
            term: p.term ? String(p.term) : '',
          })
        }
      } catch {
        toast.error('Failed to load payment')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchPayment()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data: Record<string, any> = {
        amount: form.amount,
        paymentCategory: form.paymentCategory,
        paymentType: form.paymentType,
        paymentStatus: form.paymentStatus,
      }
      if (form.paymentMethod) data.paymentMethod = form.paymentMethod
      if (form.reference) data.reference = form.reference
      if (form.term) data.term = parseInt(form.term)

      await paymentService.update(id, data)
      toast.success('Payment updated successfully')
      await navigate(`/payments/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: 'Edit' }]} />
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
      <Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: 'Edit Payment' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Payment</h1>
          <p className="text-sm text-gray-500 mt-1">Update payment details</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                <input
                  type="number"
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.paymentCategory}
                onChange={(e) => setForm({ ...form, paymentCategory: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select category</option>
                <option value="school_fee">School Fee</option>
                <option value="registration">Registration</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={form.paymentType}
                onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select type</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <input
                type="text"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                placeholder="e.g. POS, Mobile Transfer"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <input
                type="number"
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                placeholder="e.g. 1, 2, 3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                min="1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" loading={saving}>
              Update Payment
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(`/payments/${id}`)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
