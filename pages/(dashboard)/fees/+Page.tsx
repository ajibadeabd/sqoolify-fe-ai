import { useState, useEffect } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { classService, sessionService } from '../../../lib/api-services';
import { Fee, SchoolClass, Session } from '../../../lib/types';
import { useFeeStore } from '../../../lib/stores/fee-store';
import { useAppConfig } from '../../../lib/use-app-config';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import { usePermission } from '../../../lib/use-permission';

export default function FeesPage() {
  const { can } = usePermission();
  const { formatCurrency } = useAppConfig();
  const {
    fees, loading, error, total, totalPages, filters, summary,
    fetchFees, setFilter, deleteFee, invalidate,
  } = useFeeStore();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchFees();
    Promise.all([
      classService.getAll({ limit: 100 }),
      sessionService.getAll({ limit: 10 }),
    ]).then(([classRes, sessionRes]) => {
      setClasses(classRes.data || []);
      setSessions(sessionRes.data || []);
    }).catch(() => {});
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await deleteFee(id);
      toast.success('Fee structure deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete fee');
    }
  };

  const columns: Column<Fee>[] = [
    {
      key: 'class',
      header: 'Class',
      render: (item) => (item.class as any)?.name || '-',
    },
    {
      key: 'session',
      header: 'Session',
      render: (item) => (item.session as any)?.name || '-',
    },
    {
      key: 'terms',
      header: 'Fee Breakdown',
      render: (item) => {
        if (!item.terms || item.terms.length === 0) return '-';
        const totalAmount = item.terms.reduce((sum, t) => sum + (t.amount || 0), 0);
        return (
          <div>
            <p className="font-medium">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-gray-500">{item.terms.length} term(s)</p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/fees/${item._id}`); } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/fees/${item._id}/edit`); }, hidden: !can('write_fees') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_fees') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Fees' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm text-gray-500 mt-1">{total} fee structures</p>
        </div>
        {can('write_fees') && <Button onClick={() => navigate('/fees/add')}>+ Add Fee Structure</Button>}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <p className="text-sm text-blue-600 mb-1">Total Fees</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary.totalFees)}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <p className="text-sm text-green-600 mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.totalCollected)}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <p className="text-sm text-red-600 mb-1">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.totalOutstanding)}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={invalidate} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={filters.classId}
          onChange={(e) => setFilter('classId', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.sessionId}
          onChange={(e) => setFilter('sessionId', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={fees}
        loading={loading}
        emptyMessage="No fee structures found"
        onRowClick={(item) => navigate(`/fees/${item._id}`)}
      />

      <Pagination page={filters.page} totalPages={totalPages} total={total} onPageChange={(p) => setFilter('page', p)} />
    </div>
  );
}
 