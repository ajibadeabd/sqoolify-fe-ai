import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { paymentService } from '../../../lib/api-services';
import { Payment } from '../../../lib/types';
import { useAppConfig } from '../../../lib/use-app-config';
import { usePermission } from '../../../lib/use-permission';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ActionMenu from '../../../components/ui/ActionMenu';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function PaymentsPage() {
  const { formatCurrency, paymentCategories } = useAppConfig();
  const { can } = usePermission();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{
    totalPayments: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  } | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        paymentService.getAll({
          page,
          limit: 10,
          paymentStatus: filterStatus || undefined,
          paymentCategory: filterCategory || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        paymentService.getSummary(),
      ]);
      setPayments(paymentsRes.data || []);
      setTotalPages(paymentsRes.pagination?.totalPages || 1);
      setTotal(paymentsRes.pagination?.total || 0);
      setSummary(summaryRes.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterCategory, startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      case 'refunded':
        return <Badge variant="info">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleExportCSV = () => {
    if (!payments.length) return;
    const headers = ['Reference', 'Student', 'Amount', 'Category', 'Type', 'Status', 'Date'];
    const rows = payments.map((p) => {
      const student = p.student as any;
      const studentName = student?.user ? `${student.user.firstName} ${student.user.lastName}` : '-';
      return [
        p.reference || '-',
        studentName,
        p.amount,
        p.paymentCategory || '-',
        p.paymentType || '-',
        p.paymentStatus,
        p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '-',
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterCategory('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = filterStatus || filterCategory || startDate || endDate || search;

  const completedAmount = summary?.byStatus?.completed || 0;
  const pendingAmount = summary?.byStatus?.pending || 0;
  const failedAmount = summary?.byStatus?.failed || 0;

  const columns: Column<Payment>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (item) => (
        <span className="font-mono text-sm">{item.reference || '-'}</span>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      render: (item) => {
        const student = item.student as any;
        return student?.user
          ? `${student.user.firstName} ${student.user.lastName}`
          : '-';
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <span className="font-semibold">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'paymentCategory',
      header: 'Category',
      render: (item) => (
        <span className="capitalize text-sm">{item.paymentCategory?.replace('_', ' ') || '-'}</span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (item) => getStatusBadge(item.paymentStatus),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/payments/${item._id}`); } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/payments/${item._id}/edit`); }, hidden: !can('write_payments') || item.paymentMethod === 'paystack' },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Payments' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportCSV} disabled={!payments.length}>
            Export CSV
          </Button>
          {can('write_payments') && (
            <Button onClick={() => navigate('/payments/add')}>+ Record Payment</Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
          <p className="text-sm text-blue-100 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.totalPayments || 0)}</p>
          <p className="text-xs text-blue-200 mt-1">{total} transactions</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <p className="text-sm text-green-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(completedAmount)}</p>
          <p className="text-xs text-green-500 mt-1">Confirmed payments</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <p className="text-sm text-amber-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-amber-500 mt-1">Awaiting confirmation</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-5">
          <p className="text-sm text-red-600 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(failedAmount)}</p>
          <p className="text-xs text-red-500 mt-1">Unsuccessful payments</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary?.byCategory && Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue by Category</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(summary.byCategory).map(([category, amount]) => (
              <div key={category} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-600 capitalize">{category.replace('_', ' ')}</p>
                <p className="font-semibold text-purple-700 mt-1">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchPayments} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <SearchBar
              value={search}
              onChange={(val) => { setSearch(val); setPage(1); }}
              placeholder="Search by reference..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {paymentCategories.map((cat) => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments.filter(p =>
          search ? p.reference?.toLowerCase().includes(search.toLowerCase()) : true
        )}
        loading={loading}
        emptyMessage="No payments found"
        onRowClick={(item) => navigate(`/payments/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}
