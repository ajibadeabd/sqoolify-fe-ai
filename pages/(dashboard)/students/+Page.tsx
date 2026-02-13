import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { studentService, authService, classService } from '../../../lib/api-services';
import { Student, SchoolClass } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import { usePermission } from '../../../lib/use-permission';

const STUDENT_CSV_COLUMNS = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone' },
  { key: 'gender', label: 'Gender' },
  { key: 'bloodGroup', label: 'Blood Group' },
  { key: 'admissionDate', label: 'Admission Date' },
  { key: 'language', label: 'Language' },
  { key: 'aboutMe', label: 'About' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'address', label: 'Address' },
];

const STUDENT_TEMPLATE_ROWS = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '08012345678', gender: 'male', dateOfBirth: '2010-05-15', address: '123 Main St', bloodGroup: 'O+', admissionDate: '2023-09-01', language: 'English', aboutMe: 'Loves science' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '08087654321', gender: 'female', dateOfBirth: '2011-03-20', address: '456 Oak Ave', bloodGroup: 'A-', admissionDate: '2023-09-01', language: 'French', aboutMe: 'Enjoys reading' },
];

export default function StudentsPage() {
  const { can, canWrite } = usePermission();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    classService.getAll({ limit: 100 }).then((res) => setClasses(res.data || []));
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        classId: selectedClass || undefined,
      });
      setStudents(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedClass]);

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

  const getStatusBadge = (status?: string) => {
    const s = status || 'active';
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      graduated: 'bg-blue-100 text-blue-700',
      transferred: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
    };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  const columns: Column<Student>[] = [
    { key: 'admissionNo', header: 'Admission No' },
    {
      key: 'name',
      header: 'Name',
      render: (item) => { const u = typeof item.user === 'object' ? item.user : null; return u ? `${u.firstName} ${u.lastName}` : '-' },
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (item) => {
        const g = item.gender?.toLowerCase();
        if (!g) return <span className="text-gray-400">-</span>;
        const cls = g === 'male' ? 'bg-sky-100 text-sky-700' : g === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600';
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${cls}`}>
            {g}
          </span>
        );
      },
    },
    {
      key: 'class',
      header: 'Class',
      render: (item) => {
        const name = (item.class as any)?.name;
        if (!name) return <span className="text-gray-400">-</span>;
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {name}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(item.status)}`}
        >
          {item.status || 'active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/students/${item._id}`) } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/students/${item._id}/edit`) }, hidden: !can('write_students') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_students') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Students' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total students</p>
        </div>
        {canWrite('students') && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)}>Import CSV</Button>
            <Button onClick={() => navigate('/students/add')}>+ Add Student</Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchStudents} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by name or admission no..."
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}{cls.section ? ` - ${cls.section}` : ''}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyMessage="No students found"
        onRowClick={(item) => navigate(`/students/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <CsvImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import Students from CSV"
        columns={STUDENT_CSV_COLUMNS}
        templateRows={STUDENT_TEMPLATE_ROWS}
        templateFilename="students-template.csv"
        onImport={async (rows) => {
          const result = await authService.bulkRegisterStudents(rows);
          if (result.data.failureCount === 0) {
            toast.success(`${result.data.successCount} students imported`);
            fetchStudents();
          }
          return result.data;
        }}
      />
    </div>
  );
}
