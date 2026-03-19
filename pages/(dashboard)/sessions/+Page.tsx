import { useState, useEffect } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { sessionService } from '../../../lib/api-services';
import { Session } from '../../../lib/types';
import { useSessionStore } from '../../../lib/stores/session-store';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import { usePermission } from '../../../lib/use-permission';

export default function SessionsPage() {
  const { can } = usePermission();
  const {
    sessions, loading, error, total, totalPages, filters,
    fetchSessions, setFilter, deleteSession, invalidate,
  } = useSessionStore();

  const [settingCurrent, setSettingCurrent] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSetCurrent = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingCurrent(sessionId);
    try {
      await sessionService.setCurrent(sessionId);
      invalidate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to set current session');
    } finally {
      setSettingCurrent(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await deleteSession(id);
      toast.success('Session deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete session');
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

  const getCurrentTerm = (terms?: { name: string; startDate: string; endDate: string }[]) => {
    if (!terms?.length) return null;
    const now = new Date();
    const active = terms.find((t) => new Date(t.startDate) <= now && new Date(t.endDate) >= now);
    if (active) return { term: active, upcoming: false };
    const upcoming = terms
      .filter((t) => new Date(t.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
    if (upcoming) return { term: upcoming, upcoming: true };
    return null;
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
      render: (item) => {
        const result = getCurrentTerm(item.terms);
        if (!result) return <span className="text-gray-400 text-sm">—</span>;
        if (result.upcoming) {
          return (
            <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
              {result.term.name} Term (upcoming)
            </span>
          );
        }
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {result.term.name} Term
          </span>
        );
      },
    },
    {
      key: 'isCurrent',
      header: 'Status',
      render: (item) =>
        item.isCurrent ? (
          <Badge variant="success">Current</Badge>
        ) : (
          <span className="text-gray-400 text-sm">Inactive</span>
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
      key: 'actions' as const,
      header: '',
      render: (item: Session) => (
        <ActionMenu items={[
          { label: 'Set Current', onClick: (e: React.MouseEvent) => handleSetCurrent(item._id, e), hidden: item.isCurrent || !can('write_sessions') },
          { label: 'Delete', onClick: (e: React.MouseEvent) => handleDelete(item._id, e), variant: 'danger', hidden: item.isCurrent || !can('delete_sessions') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sessions' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total sessions</p>
        </div>
        {can('write_sessions') && (
          <Button onClick={() => navigate('/sessions/add')}>+ Add Session</Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={invalidate} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      <div className="mb-4 max-w-sm">
        <SearchBar
          value={filters.search}
          onChange={(val) => setFilter('search', val)}
          placeholder="Search sessions..."
        />
      </div>

      <DataTable
        columns={columns}
        data={sessions.filter((s) =>
          filters.search ? s.name.toLowerCase().includes(filters.search.toLowerCase()) : true
        )}
        loading={loading}
        emptyMessage="No sessions found"
        onRowClick={(item) => navigate(`/sessions/${item._id}`)}
      />

      <Pagination page={filters.page} totalPages={totalPages} total={total} onPageChange={(p) => setFilter('page', p)} />
    </div>
  );
}
