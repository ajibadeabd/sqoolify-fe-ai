import { useState, useEffect, useCallback } from 'react';
import { navigate } from 'vike/client/router';
import { toast } from 'sonner';
import { classService, sessionService } from '../../../lib/api-services';
import { SchoolClass } from '../../../lib/types';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import ActionMenu from '../../../components/ui/ActionMenu';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import { usePermission } from '../../../lib/use-permission';
import { useAppConfig } from '../../../lib/use-app-config';

export default function ClassesPage() {
  const { can } = usePermission();
  const { classLevels } = useAppConfig();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState('');

  useEffect(() => {
    sessionService.getAll({ limit: 100 }).then((res) => setSessions(res.data || []));
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await classService.getAll({ page, limit: 10, search: search || undefined, sessionId: selectedSession || undefined });
      setClasses(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedSession]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await classService.delete(id);
      fetchClasses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete class');
    }
  };

  const columns: Column<SchoolClass>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.name}</span>
          {item.section && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{item.section}</span>
          )}
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (item) => {
        const level = item.level ? classLevels.find((l) => l.shortCode === item.level) : null;
        return level ? (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">{level.name}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'classTeacher',
      header: 'Class Teacher',
      render: (item) => {
        const teacher = item.classTeacher as any;
        return teacher?.user
          ? `${teacher.user.firstName} ${teacher.user.lastName}`
          : <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'students',
      header: 'Students',
      render: (item) => {
        const count = item.students?.length || 0;
        const capacity = item.capacity || 0;
        const percent = capacity > 0 ? Math.round((count / capacity) * 100) : 0;
        const color = percent > 90 ? 'bg-red-100 text-red-700' : percent > 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${count > 0 ? color : 'bg-gray-100 text-gray-500'}`}>
            {count}{capacity > 0 ? ` / ${capacity}` : ''}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <ActionMenu items={[
          { label: 'View', onClick: (e) => { e.stopPropagation(); navigate(`/classes/${item._id}`) } },
          { label: 'Edit', onClick: (e) => { e.stopPropagation(); navigate(`/classes/${item._id}/edit`) }, hidden: !can('write_classes') },
          { label: 'Delete', onClick: (e) => handleDelete(item._id, e), variant: 'danger', hidden: !can('delete_classes') },
        ]} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Classes' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total classes</p>
        </div>
        {can('write_classes') && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)}>Import CSV</Button>
            <Button onClick={() => navigate('/classes/add')}>+ Add Class</Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchClasses} className="ml-2 underline">
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
            placeholder="Search classes..."
          />
        </div>
        <select
          value={selectedSession}
          onChange={(e) => {
            setSelectedSession(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
        >
          <option value="">All Sessions</option>
          {sessions.map((s: any) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={classes}
        loading={loading}
        emptyMessage="No classes found"
        onRowClick={(item) => navigate(`/classes/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <CsvImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Import Classes from CSV"
        columns={[
          { key: 'name', label: 'Name', required: true },
          { key: 'section', label: 'Section' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'level', label: 'Level' },
          { key: 'room', label: 'Room' },
          { key: 'description', label: 'Description' },
        ]}
        templateRows={[
          { name: 'JSS 1', section: 'A', capacity: '40', level: 'JSS', room: 'Room 101', description: '' },
          { name: 'JSS 2', section: 'B', capacity: '35', level: 'JSS', room: 'Room 102', description: '' },
        ]}
        templateFilename="classes-template.csv"
        onImport={async (rows) => {
          const parsed = rows.map((r: any) => ({
            name: r.name,
            section: r.section || undefined,
            capacity: r.capacity ? Number(r.capacity) : undefined,
            level: r.level || undefined,
            room: r.room || undefined,
            description: r.description || undefined,
          }));
          const result = await classService.bulkImport(parsed);
          if (result.data.failureCount === 0) {
            toast.success(`${result.data.successCount} classes imported`);
            fetchClasses();
          }
          return result.data;
        }}
      />
    </div>
  );
}
