import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { parentService, authService } from '../../../lib/api-services';
import { Parent } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import { usePermission } from '../../../lib/use-permission';

const PARENT_CSV_COLUMNS = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'address', label: 'Address' },
];

const PARENT_TEMPLATE_ROWS = [
  { firstName: 'Michael', lastName: 'Doe', email: 'michael.doe@example.com', phone: '08055556666', occupation: 'Engineer', relationship: 'father', address: '123 Main St' },
  { firstName: 'Sarah', lastName: 'Smith', email: 'sarah.smith@example.com', phone: '08077778888', occupation: 'Teacher', relationship: 'mother', address: '456 Oak Ave' },
];

export default function ParentsPage() {
  const { can, canWrite } = usePermission();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showImport, setShowImport] = useState(false);

  const fetchParents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await parentService.getAll({ page, limit: 10, search: search || undefined });
      setParents(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch parents');
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this parent?')) return;
    try {
      await parentService.delete(id);
      fetchParents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete parent');
    }
  };

  const columns: Column<Parent>[] = [
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
      key: 'phone',
      header: 'Phone',
      render: (item) => item.user?.phone || '-',
    },
    {
      key: 'occupation',
      header: 'Occupation',
      render: (item) => item.occupation || '-',
    },
    {
      key: 'relationship',
      header: 'Relationship',
      render: (item) => <span className="capitalize">{item.relationship || '-'}</span>,
    },
    {
      key: 'children',
      header: 'Children',
      render: (item) => {
        const count = item.children?.length || 0;
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {count} {count === 1 ? 'child' : 'children'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/parents/${item._id}`) } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/parents/${item._id}/edit`) }, hidden: !can('write_users') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_users') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Parents' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total parents</p>
        </div>
        {canWrite('parents') && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)}>Import CSV</Button>
            <Button onClick={() => navigate('/parents/add')}>+ Add Parent</Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchParents} className="ml-2 underline">
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
          placeholder="Search parents..."
        />
      </div>

      <DataTable
        columns={columns}
        data={parents}
        loading={loading}
        emptyMessage="No parents found"
        onRowClick={(item) => navigate(`/parents/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <CsvImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import Parents from CSV"
        columns={PARENT_CSV_COLUMNS}
        templateRows={PARENT_TEMPLATE_ROWS}
        templateFilename="parents-template.csv"
        onImport={async (rows) => {
          const result = await authService.bulkRegisterParents(rows);
          if (result.data.failureCount === 0) {
            toast.success(`${result.data.successCount} parents imported`);
            fetchParents();
          }
          return result.data;
        }}
      />
    </div>
  );
}
