import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { examService, classService, subjectService, sessionService } from '../../../lib/api-services';
import { Exam, SchoolClass, Subject, Session } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import { usePermission } from '../../../lib/use-permission';
import { useAppConfig } from '../../../lib/use-app-config';

export default function ExamsPage() {
  const { can } = usePermission();
  const { termsPerSession } = useAppConfig();
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTerm, setFilterTerm] = useState('');

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await examService.getAll({
        page,
        limit: 10,
        classId: filterClass || undefined,
        subjectId: filterSubject || undefined,
        term: filterTerm || undefined,
      });
      setExams(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterClass, filterSubject, filterTerm]);

  const fetchFilters = useCallback(async () => {
    try {
      const [classRes, subjectRes, sessionRes] = await Promise.all([
        classService.getAll({ limit: 100 }),
        subjectService.getAll({ limit: 100 }),
        sessionService.getAll({ limit: 10 }),
      ]);
      setClasses(classRes.data || []);
      setSubjects(subjectRes.data || []);
      setSessions(sessionRes.data || []);
    } catch {
      // Silently fail filter loading
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await examService.delete(id);
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'Failed to delete exam');
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

  const columns: Column<Exam>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
          item.type === 'exam' ? 'bg-purple-100 text-purple-700' :
          item.type === 'test' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {item.type || '-'}
        </span>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (item) => (item.class as any)?.name || '-',
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (item) => (item.subject as any)?.name || '-',
    },
    {
      key: 'term',
      header: 'Term',
      render: (item) => `Term ${item.term || '-'}`,
    },
    {
      key: 'maxScore',
      header: 'Max Score',
      render: (item) => item.maxScore || '-',
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => formatDate(item.date),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/exams/${item._id}`) } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/exams/${item._id}/edit`) }, hidden: !can('write_exams') },
          { label: 'Scores', onClick: (e) => { e.stopPropagation(); navigate(`/exams/${item._id}/scores`) }, hidden: !can('grade_exams') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_exams') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Exams' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total exams</p>
        </div>
        <Button onClick={() => navigate('/exams/add')}>+ Add Exam</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchExams} className="ml-2 underline">
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
            placeholder="Search exams..."
          />
        </div>
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
          value={filterSubject}
          onChange={(e) => { setFilterSubject(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
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
        data={exams.filter((e) =>
          search ? e.name.toLowerCase().includes(search.toLowerCase()) : true
        )}
        loading={loading}
        emptyMessage="No exams found"
        onRowClick={(item) => navigate(`/exams/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
