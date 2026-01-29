import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { sessionService } from '../../../lib/api-services';
import { Session } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [settingCurrent, setSettingCurrent] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sessionService.getAll({ page, limit: 10 });
      setSessions(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSetCurrent = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingCurrent(sessionId);
    try {
      await sessionService.setCurrent(sessionId);
      await fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to set current session');
    } finally {
      setSettingCurrent(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await sessionService.delete(id);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete session');
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

  const columns: Column<Session>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (item) => formatDate(item.startDate),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (item) => formatDate(item.endDate),
    },
    {
      key: 'currentTerm',
      header: 'Current Term',
      render: (item) => (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
          Term {item.currentTerm || 1}
        </span>
      ),
    },
    {
      key: 'isCurrent',
      header: 'Status',
      render: (item) =>
        item.isCurrent ? (
          <Badge variant="success">Current</Badge>
        ) : (
          <button
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            disabled={settingCurrent === item._id}
            onClick={(e) => handleSetCurrent(item._id, e)}
          >
            {settingCurrent === item._id ? 'Setting...' : 'Set Current'}
          </button>
        ),
    },
    {
      key: 'terms',
      header: 'Terms',
      render: (item) => {
        const count = item.terms?.length || 0;
        return `${count} term${count !== 1 ? 's' : ''}`;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <button
          onClick={(e) => handleDelete(item._id, e)}
          className="text-red-600 hover:text-red-800 text-sm"
          disabled={item.isCurrent}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sessions' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total sessions</p>
        </div>
        <Button onClick={() => navigate('/sessions/add')}>+ Add Session</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchSessions} className="ml-2 underline">
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
          placeholder="Search sessions..."
        />
      </div>

      <DataTable
        columns={columns}
        data={sessions.filter((s) =>
          search ? s.name.toLowerCase().includes(search.toLowerCase()) : true
        )}
        loading={loading}
        emptyMessage="No sessions found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
