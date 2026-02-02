import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { teacherService, authService } from '../../../lib/api-services';
import { Teacher } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import { usePermission } from '../../../lib/use-permission';

const TEACHER_CSV_COLUMNS = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'level', label: 'Level' },
  { key: 'experience', label: 'Experience' },
  { key: 'employmentDate', label: 'Employment Date' },
  { key: 'primarySubject', label: 'Primary Subject' },
  { key: 'address', label: 'Address' },
  { key: 'aboutMe', label: 'About' },
];

const TEACHER_TEMPLATE_ROWS = [
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com', phone: '08011112222', qualification: 'B.Ed', level: 'Senior', experience: '10 years', employmentDate: '2020-01-15', primarySubject: 'Mathematics', address: '789 Elm St', aboutMe: 'Passionate about teaching math' },
  { firstName: 'Bob', lastName: 'Williams', email: 'bob.w@example.com', phone: '08033334444', qualification: 'M.Sc', level: 'Junior', experience: '3 years', employmentDate: '2023-09-01', primarySubject: 'Physics', address: '321 Pine Rd', aboutMe: 'Physics enthusiast' },
];

export default function TeachersPage() {
  const { can } = usePermission();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showImport, setShowImport] = useState(false);

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
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/teachers/${item._id}`) } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/teachers/${item._id}/edit`) }, hidden: !can('write_users') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_teachers') },
        ]} />
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
        {can('write_teachers') && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)}>Import CSV</Button>
            <Button onClick={() => navigate('/teachers/add')}>+ Add Teacher</Button>
          </div>
        )}
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

      <CsvImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import Teachers from CSV"
        columns={TEACHER_CSV_COLUMNS}
        templateRows={TEACHER_TEMPLATE_ROWS}
        templateFilename="teachers-template.csv"
        onImport={async (rows) => {
          const result = await authService.bulkRegisterTeachers(rows);
          if (result.data.failureCount === 0) {
            toast.success(`${result.data.successCount} teachers imported`);
            fetchTeachers();
          }
          return result.data;
        }}
      />
    </div>
  );
}
