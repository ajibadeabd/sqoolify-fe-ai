import { useState, useEffect, useCallback } from 'react'
import { studentService } from '../../../lib/api-services'
import DataTable, { type Column } from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import SearchBar from '../../../components/ui/SearchBar'
import Badge from '../../../components/ui/Badge'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'

export default function MyExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchExams = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentService.getMyExams({ page, limit: 10, search })
      setExams(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
      setTotal(res.pagination?.total || 0)
    } catch {
      setExams([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchExams() }, [fetchExams])

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    published: 'success',
    draft: 'default',
    pending: 'warning',
    completed: 'info',
  }

  const columns: Column<any>[] = [
    { key: 'name', header: 'Exam', render: (item) => item.name || '-' },
    { key: 'subject', header: 'Subject', render: (item) => item.subject?.name || '-' },
    {
      key: 'date',
      header: 'Date',
      render: (item) => formatDate(item.date || item.startDate),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item) => item.duration ? `${item.duration} mins` : '-',
    },
    { key: 'maxScore', header: 'Max Score', render: (item) => item.maxScore ?? '-' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={statusVariants[item.status] || 'default'}>
          {item.status || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (item) => item.examType === 'cbt' && item.status === 'published' ? (
        <a
          href={`/exams/${item._id}/take`}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Take Exam
        </a>
      ) : null,
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Exams' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Search exams..." />
      </div>

      <DataTable
        columns={columns}
        data={exams}
        loading={loading}
        emptyMessage="No exams found for your class"
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  )
}
