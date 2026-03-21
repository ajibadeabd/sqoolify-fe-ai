import { useState, useEffect } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { sessionService, classService, reportCardService } from '../../../lib/api-services';
import { ReportCard, Session, SchoolClass } from '../../../lib/types';
import { useReportCardStore } from '../../../lib/stores/report-card-store';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import { useAppConfig } from '../../../lib/use-app-config';
import { getTermOptions } from '../../../lib/term-utils';

export default function ReportCardsPage() {
  const { termsPerSession } = useAppConfig();
  const {
    reportCards, loading, error, total, totalPages, filters,
    fetchReportCards, setFilter, invalidate,
  } = useReportCardStore();

  const termOptions = getTermOptions(termsPerSession);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genSessionId, setGenSessionId] = useState('');
  const [genTerm, setGenTerm] = useState('');
  const [genClassId, setGenClassId] = useState('');

  useEffect(() => {
    fetchReportCards();
    Promise.all([
      sessionService.getAll({ limit: 10 }),
      classService.getAll({ limit: 100 }),
    ]).then(([sessionRes, classRes]) => {
      setSessions(sessionRes.data || []);
      setClasses(classRes.data || []);
      const current = sessionRes.data?.find((s: Session) => s.isCurrent);
      if (current) setGenSessionId(current._id);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!genSessionId || !genTerm) {
      toast.error('Please select session and term');
      return;
    }
    setGenerating(true);
    try {
      const res = await reportCardService.generate(genSessionId, genTerm, genClassId || undefined);
      const count = (res.data as any)?.count || 0;
      toast.success(`${count} report card${count !== 1 ? 's' : ''} generated`);
      setGenerateOpen(false);
      invalidate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report cards');
    } finally {
      setGenerating(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total report cards</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          Generate Report Cards
        </Button>
      </div>

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
        <div className="max-w-xs">
          <SearchBar
            value={filters.search}
            onChange={(val) => setFilter('search', val)}
            placeholder="Search by student..."
          />
        </div>
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
        <select
          value={filters.term}
          onChange={(e) => setFilter('term', e.target.value)}
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

      <Pagination page={filters.page} totalPages={totalPages} total={total} onPageChange={(p) => setFilter('page', p)} />

      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Report Cards">
        <p className="text-sm text-gray-500 mb-5">
          Generate report cards for all students in a class based on their exam scores.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
            <select
              value={genSessionId}
              onChange={(e) => setGenSessionId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Select session</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
            <div className="flex gap-2 flex-wrap">
              {termOptions.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setGenTerm(t.value)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    genTerm === t.value
                      ? `${t.color.bg} ${t.color.text} ${t.color.border} border-current`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class (optional)</label>
            <select
              value={genClassId}
              onChange={(e) => setGenClassId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Leave empty to generate for all classes</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerate} loading={generating} disabled={!genSessionId || !genTerm}>
            Generate
          </Button>
        </div>
      </Modal>
    </div>
  );
}
