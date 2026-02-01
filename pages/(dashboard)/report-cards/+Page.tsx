import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { reportCardService, sessionService, classService } from '../../../lib/api-services';
import { ReportCard, Session, SchoolClass } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import { useAppConfig } from '../../../lib/use-app-config';

export default function ReportCardsPage() {
  const { termsPerSession } = useAppConfig();
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Filters
  const [filterSession, setFilterSession] = useState('');
  const [filterTerm, setFilterTerm] = useState('');

  const fetchReportCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportCardService.getAll({
        page,
        limit: 10,
        sessionId: filterSession || undefined,
        term: filterTerm || undefined,
      });
      setReportCards(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report cards');
      setReportCards([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterSession, filterTerm]);

  const fetchFilters = useCallback(async () => {
    try {
      const [sessionRes, classRes] = await Promise.all([
        sessionService.getAll({ limit: 10 }),
        classService.getAll({ limit: 100 }),
      ]);
      setSessions(sessionRes.data || []);
      setClasses(classRes.data || []);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchReportCards();
  }, [fetchReportCards]);

  const handleGenerate = async () => {
    // For now, just show an alert - need student, session, term selection
    alert('Please select a student to generate report card');
  };

  const columns: Column<ReportCard>[] = [
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
      key: 'class',
      header: 'Class',
      render: (item) => (item.class as any)?.name || '-',
    },
    {
      key: 'term',
      header: 'Term',
      render: (item) => `Term ${item.term || '-'}`,
    },
    {
      key: 'session',
      header: 'Session',
      render: (item) => (item.session as any)?.name || '-',
    },
    {
      key: 'totalScore',
      header: 'Total',
      render: (item) => item.totalScore ?? '-',
    },
    {
      key: 'average',
      header: 'Average',
      render: (item) => item.average != null ? item.average.toFixed(1) : '-',
    },
    {
      key: 'position',
      header: 'Position',
      render: (item) => {
        if (!item.position) return '-';
        const suffix = item.position === 1 ? 'st' : item.position === 2 ? 'nd' : item.position === 3 ? 'rd' : 'th';
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {item.position}{suffix}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
          {item.status || 'draft'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Report Cards' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total report cards</p>
        </div>
        <Button onClick={handleGenerate} loading={generating}>
          Generate Report Cards
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchReportCards} className="ml-2 underline">
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
            placeholder="Search by student..."
          />
        </div>
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
        <select
          value={filterTerm}
          onChange={(e) => { setFilterTerm(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Terms</option>
          {Array.from({ length: termsPerSession }, (_, i) => (
            <option key={i + 1} value={i + 1}>Term {i + 1}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={reportCards}
        loading={loading}
        emptyMessage="No report cards found"
        onRowClick={(item) => navigate(`/report-cards/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
