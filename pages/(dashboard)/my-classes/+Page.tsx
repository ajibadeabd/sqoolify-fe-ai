import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { teacherService } from '../../../lib/api-services'
import DataTable, { type Column } from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import SearchBar from '../../../components/ui/SearchBar'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'

export default function MyClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await teacherService.getMyClasses({ page, limit: 10, search })
      setClasses(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
      setTotal(res.pagination?.total || 0)
    } catch {
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClasses() }, [page, search])

  const columns: Column<any>[] = [
    { key: 'name', header: 'Class Name' },
    { key: 'section', header: 'Section', render: (item) => item.section || '-' },
    { key: 'students', header: 'Students', render: (item) => item.students?.length || 0 },
    { key: 'capacity', header: 'Capacity', render: (item) => item.capacity || '-' },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Classes' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Search classes..." />
      </div>

      <DataTable
        columns={columns}
        data={classes}
        loading={loading}
        emptyMessage="No classes assigned to you"
        onRowClick={(item) => navigate(`/classes/${item._id}`)}
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  )
}
