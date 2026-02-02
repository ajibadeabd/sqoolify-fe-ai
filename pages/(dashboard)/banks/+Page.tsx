import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { bankService } from '../../../lib/api-services';
import { Bank } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import { usePermission } from '../../../lib/use-permission';

export default function BanksPage() {
  const { can } = usePermission();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bankService.getAll({ page, limit: 10 });
      setBanks(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch banks');
      setBanks([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    try {
      await bankService.delete(id);
      fetchBanks();
    } catch (err: any) {
      alert(err.message || 'Failed to delete bank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bankService.create(formData);
      setShowForm(false);
      setFormData({ accountName: '', bankName: '', accountNumber: '', isActive: true });
      fetchBanks();
    } catch (err: any) {
      alert(err.message || 'Failed to create bank');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Bank>[] = [
    {
      key: 'bankName',
      header: 'Bank Name',
      render: (item) => <span className="font-medium">{item.bankName}</span>,
    },
    {
      key: 'accountName',
      header: 'Account Name',
    },
    {
      key: 'accountNumber',
      header: 'Account Number',
      render: (item) => (
        <span className="font-mono">{item.accountNumber}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'error'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/banks/${item._id}`); } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/banks/${item._id}`); }, hidden: !can('write_banks') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_banks') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Banks' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">{total} bank accounts</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Bank Account</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchBanks} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Add Bank Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Bank Account</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex gap-2 mt-4">
              <Button type="submit" loading={saving}>Save</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={banks}
        loading={loading}
        emptyMessage="No bank accounts found"
        onRowClick={(item) => navigate(`/banks/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
