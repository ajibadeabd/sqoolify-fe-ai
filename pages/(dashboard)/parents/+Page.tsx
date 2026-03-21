import { useState, useEffect } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { authService } from '../../../lib/api-services';
import { Parent } from '../../../lib/types';
import { useParentStore } from '../../../lib/stores/parent-store';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
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
  const {
    parents, loading, error, total, totalPages, filters,
    fetchParents, setFilter, deleteParent, invalidate,
  } = useParentStore();

  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchParents();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteParent(deleteTarget);
      toast.success('Parent deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete parent');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns: Column<Parent>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => { const u = typeof item.user === 'object' ? item.user : null; return u ? `${u.firstName} ${u.lastName}` : '-' },
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => {
        const user = typeof item.user === 'object' ? item.user : null;
        return user?.email ? <span className="text-sm text-gray-500">{user.email}</span> : '-';
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => { const u = typeof item.user === 'object' ? item.user : null; return u?.phone || '-' },
    },
    {
      key: 'occupation',
      header: 'Occupation',
      render: (item) => item.occupation ? <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">{item.occupation}</span> : '-',
    },
    {
      key: 'relationship',
      header: 'Relationship',
      render: (item) => {
        if (!item.relationship) return '-';
        const colorMap: Record<string, string> = {
          father: 'bg-blue-100 text-blue-700',
          mother: 'bg-pink-100 text-pink-700',
          guardian: 'bg-orange-100 text-orange-700',
        };
        const colors = colorMap[item.relationship] || 'bg-gray-100 text-gray-600';
        return <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${colors}`}>{item.relationship}</span>;
      },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
          <button onClick={invalidate} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      <div className="mb-4 max-w-sm">
        <SearchBar
          value={filters.search}
          onChange={(val) => setFilter('search', val)}
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

      <Pagination page={filters.page} totalPages={totalPages} total={total} onPageChange={(p) => setFilter('page', p)} />

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
            invalidate();
          }
          return result.data;
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Parent"
        message="Are you sure you want to delete this parent? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
