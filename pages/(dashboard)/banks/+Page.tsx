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
import Modal from '../../../components/ui/Modal';
import { usePermission } from '../../../lib/use-permission';
import { toast } from 'sonner';

export default function BanksPage() {
  const { can } = usePermission();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Bank list from gateway
  const [bankList, setBankList] = useState<{ name: string; code: string }[]>([]);
  const [bankListLoading, setBankListLoading] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    bankCode: '',
    accountNumber: '',
    isActive: true,
  });
  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
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

  const openForm = async () => {
    setShowForm(true);
    if (bankList.length === 0) {
      setBankListLoading(true);
      try {
        const res = await bankService.getBankList();
        setBankList(res.data || []);
      } catch (err: any) {
        console.error('Failed to fetch bank list:', err);
      } finally {
        setBankListLoading(false);
      }
    }
  };

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = bankList.find((b) => b.code === e.target.value);
    setFormData({
      ...formData,
      bankCode: selected?.code || '',
      bankName: selected?.name || '',
    });
    // Re-resolve if account number already filled
    if (formData.accountNumber.length === 10 && selected?.code) {
      resolveAccount(formData.accountNumber, selected.code);
    } else {
      setResolvedName(null);
      setResolveError(null);
    }
  };

  const resolveAccount = async (accountNumber: string, bankCode: string) => {
    setResolving(true);
    setResolvedName(null);
    setResolveError(null);
    try {
      const res = await bankService.resolveAccount(accountNumber, bankCode);
      const name = res.data?.accountName || '';
      setResolvedName(name);
      setFormData((prev) => ({ ...prev, accountName: name }));
    } catch (err: any) {
      setResolveError(err.message || 'Could not verify account');
    } finally {
      setResolving(false);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, accountNumber: val }));
    if (val.length < 10) {
      setResolvedName(null);
      setResolveError(null);
    } else if (val.length === 10 && formData.bankCode) {
      resolveAccount(val, formData.bankCode);
    }
  };

  // const handleDelete = async (id: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (!confirm('Are you sure you want to delete this bank account?')) return;
  //   try {
  //     await bankService.delete(id);
  //     fetchBanks();
  //   } catch (err: any) {
  //     toast.error(err.message || 'Failed to delete bank');
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resolvedName) {
      toast.error('Please verify the account number first');
      return;
    }
    setSaving(true);
    try {
      await bankService.create({
        accountName: formData.accountName,
        bankName: formData.bankName,
        bankCode: formData.bankCode,
        accountNumber: formData.accountNumber,
      });
      setShowForm(false);
      setFormData({ accountName: '', bankName: '', bankCode: '', accountNumber: '', isActive: true });
      setResolvedName(null);
      setResolveError(null);
      fetchBanks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create bank');
    } finally {
      setSaving(false);
    }
  };

  const verificationBadge = (status: Bank['verificationStatus']) => {
    const map: Record<string, 'warning' | 'success' | 'danger'> = {
      pending: 'warning',
      verified: 'success',
      failed: 'danger',
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
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
      key: 'verificationStatus',
      header: 'Verification',
      render: (item) => verificationBadge(item.verificationStatus),
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
          {
            label: 'Set Active',
            hidden: item.isActive || !can('write_banks'),
            onClick: async (e) => {
              e.stopPropagation();
              try {
                await bankService.update(item._id, { isActive: true });
                fetchBanks();
              } catch (err: any) {
                toast.error(err.message || 'Failed to set active');
              }
            },
          },
          {
            label: 'Set Inactive',
            hidden: !item.isActive || !can('write_banks'),
            onClick: async (e) => {
              e.stopPropagation();
              try {
                await bankService.update(item._id, { isActive: false });
                fetchBanks();
              } catch (err: any) {
                toast.error(err.message || 'Failed to set inactive');
              }
            },
          },
          // { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_banks') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Banks' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">{total} bank accounts</p>
        </div>
        <Button onClick={openForm}>+ Add Bank Account</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchBanks} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Add Bank Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setResolvedName(null); setResolveError(null); }} title="Add Bank Account">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
              <select
                value={formData.bankCode}
                onChange={handleBankSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={bankListLoading}
              >
                <option value="">{bankListLoading ? 'Loading banks...' : 'Select a bank'}</option>
                {bankList.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.accountNumber}
                onChange={handleAccountNumberChange}
                placeholder="10-digit account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {resolving && (
                <p className="text-xs text-gray-500 mt-1">Verifying account...</p>
              )}
              {resolvedName && (
                <p className="text-xs text-green-600 mt-1">✓ {resolvedName}</p>
              )}
              {resolveError && (
                <p className="text-xs text-red-600 mt-1">{resolveError}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input
                type="text"
                value={formData.accountName}
                readOnly
                placeholder="Auto-filled after account number verification"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" loading={saving}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setResolvedName(null); setResolveError(null); }}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <DataTable
        columns={columns}
        data={banks}
        loading={loading}
        emptyMessage="No bank accounts found"
        onRowClick={(item) => navigate(`/banks/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}
