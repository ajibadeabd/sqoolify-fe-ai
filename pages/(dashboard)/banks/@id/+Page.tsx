import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { bankService } from '../../../../lib/api-services'
import { Bank } from '../../../../lib/types'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import { usePermission } from '../../../../lib/use-permission'

export default function BankDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const [bank, setBank] = useState<Bank | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await bankService.getById(id)
        setBank(res.data)
      } catch {
        setBank(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchBank()
  }, [id])

  const handleToggleActive = async () => {
    if (!bank) return
    setSaving(true)
    try {
      const res = await bankService.update(id, { isActive: !bank.isActive })
      setBank(res.data)
      toast.success(res.data?.isActive ? 'Bank set as active' : 'Bank set as inactive')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update bank')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await bankService.delete(id)
      toast.success('Bank account deleted')
      await navigate('/banks')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete bank')
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

  if (!bank) {
    return <div className="text-center py-12 text-gray-500">Bank account not found</div>
  }

  const verificationVariant: Record<string, 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    verified: 'success',
    failed: 'danger',
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Banks', href: '/banks' }, { label: bank.bankName }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bank Account Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/banks')}>Back</Button>
          {can('write_banks') && (
            <Button variant={bank.isActive ? 'secondary' : 'primary'} loading={saving} onClick={handleToggleActive}>
              {bank.isActive ? 'Set Inactive' : 'Set Active'}
            </Button>
          )}
          {/* {can('delete_banks') && (
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>
          )} */}
        </div>
      </div>

      <Card title="Account Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Bank Name</label>
            <p className="font-medium">{bank.bankName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Bank Code</label>
            <p className="font-mono font-medium">{bank.bankCode}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Account Name</label>
            <p className="font-medium">{bank.accountName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Account Number</label>
            <p className="font-mono font-medium">{bank.accountNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Verification</label>
            <div className="mt-1">
              <Badge variant={verificationVariant[bank.verificationStatus] || 'default'}>
                {bank.verificationStatus}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={bank.isActive ? 'success' : 'error'}>
                {bank.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {bank.createdAt && (
        <Card title="Timestamps">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Created</label>
              <p className="font-medium">
                {new Date(bank.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {bank.updatedAt && (
              <div>
                <label className="text-sm text-gray-500">Last Updated</label>
                <p className="font-medium">
                  {new Date(bank.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Bank Account"
        message={`Are you sure you want to delete ${bank.bankName}? This action cannot be undone.`}
        loading={deleting}
      /> */}
    </div>
  )
}
