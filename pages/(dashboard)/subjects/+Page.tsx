import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { subjectService } from '../../../lib/api-services';
import { Subject } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import { usePermission } from '../../../lib/use-permission';

export default function SubjectsPage() {
  const { can } = usePermission();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showImport, setShowImport] = useState(false);

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
      key: 'teachers',
      header: 'Teachers',
      render: (item) => {
        const teachers = (item.teachers || []) as any[];
        if (!teachers.length) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {teachers.map((t, i) => (
              <span key={i} className="px-1.5 py-0.5 text-xs bg-green-50 text-green-700 rounded">
                {t?.user ? `${t.user.firstName} ${t.user.lastName}` : t}
              </span>
            ))}
          </div>
        );
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
      key: 'actions' as const,
      header: '',
      render: (item: Subject) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/subjects/${item._id}`) } },
          { label: 'Edit', onClick: (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/subjects/${item._id}/edit`) }, hidden: !can('write_subjects') },
          { label: 'Delete', onClick: (e: React.MouseEvent) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_subjects') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Subjects' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total subjects</p>
        </div>
        {can('write_subjects') && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>Import CSV</Button>
            <Button size="sm" onClick={() => navigate('/subjects/add')}>+ Add Subject</Button>
          </div>
        )}
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
        onRowClick={(item) => navigate(`/subjects/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <CsvImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import Subjects from CSV"
        columns={[
          { key: 'name', label: 'Subject Name', required: true },
          { key: 'code', label: 'Subject Code', required: true },
          { key: 'isCore', label: 'Is Core' },
          { key: 'description', label: 'Description' },
        ]}
        templateRows={[
          { name: 'Mathematics', code: 'MATH101', isCore: 'true', description: 'Basic mathematics' },
          { name: 'English', code: 'ENG101', isCore: 'true', description: 'English language' },
        ]}
        templateFilename="subjects-template.csv"
        onImport={async (rows) => {
          const parsed = rows.map((r: any) => ({
            name: r.name,
            code: r.code,
            isCore: r.isCore === 'true' || r.isCore === '1',
            description: r.description || undefined,
          }));
          const result = await subjectService.bulkImport(parsed);
          if (result.data.failureCount === 0) {
            toast.success(`${result.data.successCount} subjects imported`);
            fetchSubjects();
          }
          return result.data;
        }}
      />
    </div>
  );
}
