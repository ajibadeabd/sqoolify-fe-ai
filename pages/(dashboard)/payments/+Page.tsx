import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { paymentService, studentService } from '../../../lib/api-services';
import { Payment, Student } from '../../../lib/types';
import { useAppConfig } from '../../../lib/use-app-config';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function PaymentsPage() {
  const { formatCurrency } = useAppConfig();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{ totalPayments: number } | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        paymentService.getAll({
          page,
          limit: 10,
          status: filterStatus || undefined,
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
  }, [page, filterStatus]);

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
        return <Badge variant="error">Failed</Badge>;
      case 'refunded':
        return <Badge variant="info">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
        <span className="font-medium">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'paymentCategory',
      header: 'Category',
      render: (item) => (
        <span className="capitalize">{item.paymentCategory?.replace('_', ' ') || '-'}</span>
      ),
    },
    {
      key: 'paymentType',
      header: 'Type',
      render: (item) => (
        <span className="capitalize">{item.paymentType?.replace('_', ' ') || '-'}</span>
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
      render: (item) => formatDate(item.createdAt),
    },
  ];

  return (
    <div>
        <Breadcrumbs items={[{ label: 'Payments' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total payments</p>
        </div>
        <Button onClick={() => navigate('/payments/add')}>+ Record Payment</Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <p className="text-sm text-blue-600 mb-1">Total Payments</p>
            <p className="text-2xl font-bold text-blue-700">{summary.totalPayments}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <p className="text-sm text-green-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.totalPayments)}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchPayments} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="max-w-xs">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by reference..."
          />
        </div>
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

      <DataTable
        columns={columns}
        data={payments.filter(p =>
          search ? p.reference?.toLowerCase().includes(search.toLowerCase()) : true
        )}
        loading={loading}
        emptyMessage="No payments found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
