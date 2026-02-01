import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { feeService, classService, sessionService } from '../../../lib/api-services';
import { Fee, SchoolClass, Session } from '../../../lib/types';
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
  const [fees, setFees] = useState<Fee[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{ totalCollected: number; totalOutstanding: number } | null>(null);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterSession, setFilterSession] = useState('');

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [feesRes, summaryRes] = await Promise.all([
        feeService.getAll({
          page,
          limit: 10,
          classId: filterClass || undefined,
          sessionId: filterSession || undefined,
        }),
        feeService.getSummary(),
      ]);
      setFees(feesRes.data || []);
      setTotalPages(feesRes.pagination?.totalPages || 1);
      setTotal(feesRes.pagination?.total || 0);
      setSummary(summaryRes.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fees');
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterClass, filterSession]);

  const fetchFilters = useCallback(async () => {
    try {
      const [classRes, sessionRes] = await Promise.all([
        classService.getAll({ limit: 100 }),
        sessionService.getAll({ limit: 10 }),
      ]);
      setClasses(classRes.data || []);
      setSessions(sessionRes.data || []);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await feeService.delete(id);
      fetchFees();
    } catch (err: any) {
      alert(err.message || 'Failed to delete fee');
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
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_fees') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Fees' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm text-gray-500 mt-1">{total} fee structures</p>
        </div>
        <Button onClick={() => navigate('/fees/add')}>+ Add Fee Structure</Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          <button onClick={fetchFees} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={filterClass}
          onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterSession}
          onChange={(e) => { setFilterSession(e.target.value); setPage(1); }}
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
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
