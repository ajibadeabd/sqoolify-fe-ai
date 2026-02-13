import { useState, useEffect } from 'react'
import { studentService } from '../../../lib/api-services'
import DataTable, { type Column } from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import SearchBar from '../../../components/ui/SearchBar'
import Badge from '../../../components/ui/Badge'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'

export default function MyResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await studentService.getMyResults({ page, limit: 10, search })
      setResults(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
      setTotal(res.pagination?.total || 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResults() }, [page, search])

  const columns: Column<any>[] = [
    { key: 'exam', header: 'Exam', render: (item) => item.exam?.name || '-' },
    { key: 'subject', header: 'Subject', render: (item) => item.exam?.subject?.name || item.subject?.name || '-' },
    { key: 'score', header: 'Score', render: (item) => item.score ?? '-' },
    { key: 'maxScore', header: 'Max Score', render: (item) => item.exam?.maxScore || '-' },
    {
      key: 'percentage',
      header: 'Percentage',
      render: (item) => {
        if (item.score != null && item.exam?.maxScore) {
          return `${((item.score / item.exam.maxScore) * 100).toFixed(1)}%`
        }
        return '-'
      },
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (item) => item.grade
        ? <Badge variant={item.grade === 'A' ? 'success' : item.grade === 'F' ? 'danger' : 'default'}>
            {item.grade}
          </Badge>
        : '-',
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => item.exam?.date ? new Date(item.exam.date).toLocaleDateString() : '-',
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Results' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Search results..." />
      </div>

      <DataTable
        columns={columns}
        data={results}
        loading={loading}
        emptyMessage="No results found"
      />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  )
}
