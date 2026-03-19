import { useState, useEffect } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { classService, subjectService, sessionService } from '../../../lib/api-services';
import { Exam, SchoolClass, Subject, Session } from '../../../lib/types';
import { useExamStore } from '../../../lib/stores/exam-store';
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
  const {
    exams, loading, error, total, totalPages, filters,
    fetchExams, setFilter, deleteExam, invalidate,
  } = useExamStore();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchExams();
    Promise.all([
      classService.getAll({ limit: 100 }),
      subjectService.getAll({ limit: 100 }),
      sessionService.getAll({ limit: 10 }),
    ]).then(([classRes, subjectRes, sessionRes]) => {
      setClasses(classRes.data || []);
      setSubjects(subjectRes.data || []);
      setSessions(sessionRes.data || []);
    }).catch(() => {});
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await deleteExam(id);
      toast.success('Exam deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete exam');
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
      key: 'approvalStatus' as any,
      header: 'Status',
      render: (item) => {
        const status = item.approvalStatus || 'draft'
        const colors: Record<string, string> = {
          draft: 'bg-gray-100 text-gray-700',
          pending_approval: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
        }
        const labels: Record<string, string> = {
          draft: 'Draft',
          pending_approval: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
        }
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
            {labels[status] || status}
          </span>
        )
      },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total exams</p>
        </div>
        {can('write_exams') && <Button onClick={() => navigate('/exams/add')}>+ Add Exam</Button>}
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
            placeholder="Search exams..."
          />
        </div>
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
          value={filters.subjectId}
          onChange={(e) => setFilter('subjectId', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
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
        data={exams.filter((e) =>
          filters.search ? e.name.toLowerCase().includes(filters.search.toLowerCase()) : true
        )}
        loading={loading}
        emptyMessage="No exams found"
        onRowClick={(item) => navigate(`/exams/${item._id}`)}
      />

      <Pagination page={filters.page} totalPages={totalPages} total={total} onPageChange={(p) => setFilter('page', p)} />
    </div>
  );
}
