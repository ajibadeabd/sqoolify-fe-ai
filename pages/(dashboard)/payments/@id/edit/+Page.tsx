import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { paymentService } from '../../../../../lib/api-services'
import type { Payment } from '../../../../../lib/types'
import { useAppConfig } from '../../../../../lib/use-app-config'
import Card from '../../../../../components/ui/Card'
import Button from '../../../../../components/ui/Button'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function EditPaymentPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { currencySymbol, paymentCategories, paymentTypes, paymentMethods } = useAppConfig()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    amount: 0,
    paymentCategory: '',
    paymentType: '',
    paymentMethod: '',
    paymentStatus: '',
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.paymentCategory}
                onChange={(e) => setForm({ ...form, paymentCategory: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select category</option>
                {paymentCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
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
                {paymentTypes.map((type) => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
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
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select method</option>
                {paymentMethods.filter(m => m !== 'paystack').map((method) => (
                  <option key={method} value={method}>{method.replace('_', ' ')}</option>
                ))}
              </select>
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
