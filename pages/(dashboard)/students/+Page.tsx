import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { studentService } from '../../../lib/api-services';
import { Student } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getAll({ page, limit: 10, search: search || undefined });
      setStudents(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.delete(id);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const columns: Column<Student>[] = [
    { key: 'admissionNo', header: 'Admission No' },
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.user ? `${item.user.firstName} ${item.user.lastName}` : '-',
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (item) => <span className="capitalize">{item.gender || '-'}</span>,
    },
    {
      key: 'class',
      header: 'Class',
      render: (item) => (item.class as any)?.name || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            item.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {item.status || 'active'}
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
      <Breadcrumbs items={[{ label: 'Students' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total students</p>
        </div>
        <Button onClick={() => navigate('/students/add')}>+ Add Student</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchStudents} className="ml-2 underline">
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
          placeholder="Search by name or admission no..."
        />
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyMessage="No students found"
        onRowClick={(item) => navigate(`/students/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
