import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { feeService } from '../../../../lib/api-services'
import { Fee } from '../../../../lib/types'
import { useAppConfig } from '../../../../lib/use-app-config'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import { usePermission } from '../../../../lib/use-permission'

export default function FeeDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const { formatCurrency } = useAppConfig()
  const [fee, setFee] = useState<Fee | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await feeService.getById(id)
        setFee(res.data)
      } catch {
        setFee(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchFee()
  }, [id])

  const handleBulkAssign = async () => {
    setAssigning(true)
    try {
      const res = await feeService.bulkAssign(id)
      const { assigned, skipped } = res.data
      if (assigned > 0) {
        toast.success(`Assigned to ${assigned} student${assigned > 1 ? 's' : ''}${skipped > 0 ? `, ${skipped} already assigned` : ''}`)
      } else {
        toast.info('All students in this class are already assigned')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign fee')
    } finally {
      setAssigning(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await feeService.delete(id)
      toast.success('Fee structure deleted')
      await navigate('/fees')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete fee')
      setDeleting(false)
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

  if (!fee) {
    return <div className="text-center py-12 text-gray-500">Fee structure not found</div>
  }

  const cls = typeof fee.class === 'object' ? fee.class : null
  const session = typeof fee.session === 'object' ? fee.session : null
  const totalAmount = fee.terms?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Fees', href: '/fees' }, { label: cls ? cls.name : 'Fee Details' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fee Structure Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/fees')}>Back</Button>
          {can('write_fees') && <Button variant="secondary" onClick={handleBulkAssign} loading={assigning}>Assign to Students</Button>}
          {can('write_fees') && <Button variant="primary" onClick={() => navigate(`/fees/${id}/edit`)}>Edit</Button>}
          {can('delete_fees') && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
        </div>
      </div>

      {/* Overview Card */}
      <Card title="Overview">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-sm text-gray-500">Class</label>
            <p className="font-medium">{cls ? `${cls.name}${(cls as any).section ? ` - ${(cls as any).section}` : ''}` : '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Session</label>
            <p className="font-medium">{session ? (session as any).name : '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Total Fee</label>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={fee.isActive ? 'success' : 'error'}>
                {fee.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Term Breakdown */}
      <Card title="Term Breakdown">
        <div className="space-y-4">
          {fee.terms?.map((term, index) => (
            <div key={index} className="border rounded-xl p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {term.term}
                  </span>
                  <h4 className="font-semibold text-gray-900">Term {term.term}</h4>
                </div>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(term.amount)}</span>
              </div>

              {term.dueDate && (
                <p className="text-sm text-gray-500 mb-3">
                  Due: {new Date(term.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}

              {term.breakdowns && term.breakdowns.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Fee Items</p>
                  <div className="space-y-1">
                    {term.breakdowns.map((bd, bdIndex) => (
                      <div key={bdIndex} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{bd.item}</span>
                        <span className="font-medium">{formatCurrency(bd.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {(!fee.terms || fee.terms.length === 0) && (
            <p className="text-gray-500 text-sm italic py-4">No terms defined</p>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Fee Structure"
        message="Are you sure you want to delete this fee structure? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}
