import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { subjectService } from '../../../lib/api-services';
import { Subject } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subjectService.getAll({ page, limit: 10, search: search || undefined });
      setSubjects(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectService.delete(id);
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    }
  };

  const columns: Column<Subject>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'code',
      header: 'Code',
      render: (item) => (
        <span className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded">
          {item.code || '-'}
        </span>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (item) => (item.class as any)?.name || '-',
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (item) => {
        const teacher = item.teacher as any;
        return teacher?.user
          ? `${teacher.user.firstName} ${teacher.user.lastName}`
          : '-';
      },
    },
    {
      key: 'isCore',
      header: 'Type',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${item.isCore ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
          {item.isCore ? 'Core' : 'Elective'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <button
          onClick={(e) => handleDelete(item._id, e)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Subjects' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total subjects</p>
        </div>
        <Button onClick={() => navigate('/subjects/add')}>+ Add Subject</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchSubjects} className="ml-2 underline">
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
          placeholder="Search subjects..."
        />
      </div>

      <DataTable
        columns={columns}
        data={subjects}
        loading={loading}
        emptyMessage="No subjects found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
