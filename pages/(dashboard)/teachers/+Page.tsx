import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { teacherService } from '../../../lib/api-services';
import { Teacher } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await teacherService.getAll({ page, limit: 10, search: search || undefined });
      setTeachers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await teacherService.delete(id);
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete teacher');
    }
  };

  const columns: Column<Teacher>[] = [
    { key: 'employeeId', header: 'Employee ID' },
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.user ? `${item.user.firstName} ${item.user.lastName}` : '-',
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => item.user?.email || '-',
    },
    {
      key: 'qualification',
      header: 'Qualification',
      render: (item) => item.qualification || '-',
    },
    {
      key: 'classTeacher',
      header: 'Class Teacher',
      render: (item) => {
        if (!item.isClassTeacher) return <span className="text-gray-400">No</span>;
        const className = (item.assignedClass as any)?.name;
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {className || 'Yes'}
          </span>
        );
      },
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (item) => {
        const count = item.subjects?.length || 0;
        return count > 0 ? `${count} subject${count > 1 ? 's' : ''}` : '-';
      },
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
      <Breadcrumbs items={[{ label: 'Teachers' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total teachers</p>
        </div>
        <Button onClick={() => navigate('/teachers/add')}>+ Add Teacher</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchTeachers} className="ml-2 underline">
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
          placeholder="Search teachers..."
        />
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        emptyMessage="No teachers found"
        onRowClick={(item) => navigate(`/teachers/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
