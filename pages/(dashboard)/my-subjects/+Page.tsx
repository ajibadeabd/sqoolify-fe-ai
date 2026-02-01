import { useState, useEffect } from 'react'
import { teacherService } from '../../../lib/api-services'
import DataTable, { type Column } from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import SearchBar from '../../../components/ui/SearchBar'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'

export default function MySubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const res = await teacherService.getMySubjects({ page, limit: 10, search })
      setSubjects(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
    } catch {
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubjects() }, [page, search])

  const columns: Column<any>[] = [
    { key: 'name', header: 'Subject Name' },
    { key: 'code', header: 'Code', render: (item) => item.code || '-' },
    { key: 'class', header: 'Class', render: (item) => item.class?.name || '-' },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Subjects' }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Search subjects..." />
      </div>

      <DataTable
        columns={columns}
        data={subjects}
        loading={loading}
        emptyMessage="No subjects assigned to you"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
