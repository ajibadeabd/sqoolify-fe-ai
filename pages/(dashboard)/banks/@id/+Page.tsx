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
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    isActive: true,
  })

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await bankService.getById(id)
        setBank(res.data)
        if (res.data) {
          setFormData({
            bankName: res.data.bankName,
            accountName: res.data.accountName,
            accountNumber: res.data.accountNumber,
            isActive: res.data.isActive,
          })
        }
      } catch {
        setBank(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchBank()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await bankService.update(id, formData)
      setBank(res.data)
      setEditing(false)
      toast.success('Bank account updated')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update bank')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (bank) {
      setFormData({
        bankName: bank.bankName,
        accountName: bank.accountName,
        accountNumber: bank.accountNumber,
        isActive: bank.isActive,
      })
    }
    setEditing(false)
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

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Banks', href: '/banks' }, { label: bank.bankName }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bank Account Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/banks')}>Back</Button>
          {can('write_banks') && !editing && (
            <Button variant="primary" onClick={() => setEditing(true)}>Edit</Button>
          )}
          {can('delete_banks') && !editing && (
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>
          )}
        </div>
      </div>

      <Card title="Account Information">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={saving}>Save Changes</Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm text-gray-500">Bank Name</label>
              <p className="font-medium">{bank.bankName}</p>
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
              <label className="text-sm text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={bank.isActive ? 'success' : 'error'}>
                  {bank.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        )}
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

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Bank Account"
        message={`Are you sure you want to delete ${bank.bankName}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
