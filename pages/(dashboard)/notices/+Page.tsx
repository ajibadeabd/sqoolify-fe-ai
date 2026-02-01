import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { noticeService } from '../../../lib/api-services';
import { Notice } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import { usePermission } from '../../../lib/use-permission';

export default function NoticesPage() {
  const { can } = usePermission();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await noticeService.getAll({ page, limit: 10, search: search || undefined });
      setNotices(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await noticeService.delete(id);
      fetchNotices();
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await noticeService.togglePin(id);
      fetchNotices();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle pin');
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: Column<Notice>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.isPinned && (
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium">{item.title}</span>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Content',
      render: (item) => (
        <span className="text-gray-600 line-clamp-1 max-w-xs">{item.content}</span>
      ),
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.visibility?.map((v) => (
            <span key={v} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
              {v}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'notificationType',
      header: 'Type',
      render: (item) => {
        const colors: Record<string, string> = {
          info: 'bg-blue-100 text-blue-700',
          warning: 'bg-yellow-100 text-yellow-700',
          urgent: 'bg-red-100 text-red-700',
          success: 'bg-green-100 text-green-700',
        };
        return (
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${colors[item.notificationType] || 'bg-gray-100 text-gray-700'}`}>
            {item.notificationType || 'info'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (item) => {
        if (!item.expiresAt) return '-';
        const isExpired = new Date(item.expiresAt) < new Date();
        return (
          <span className={isExpired ? 'text-red-600' : 'text-gray-600'}>
            {formatDate(item.expiresAt)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/notices/${item._id}`) } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/notices/${item._id}/edit`) }, hidden: !can('write_notices') },
          { label: item.isPinned ? 'Unpin' : 'Pin', onClick: (e) => handleTogglePin(item._id, e), hidden: !can('write_notices') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_notices') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Notices' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-sm text-gray-500 mt-1">{total} notices</p>
        </div>
        <Button onClick={() => navigate('/notices/add')}>+ Add Notice</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchNotices} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      <div className="mb-4 max-w-sm">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search notices..."
        />
      </div>

      <DataTable
        columns={columns}
        data={notices}
        loading={loading}
        emptyMessage="No notices found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
