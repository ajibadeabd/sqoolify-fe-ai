import { useState, useEffect, useCallback } from 'react'
import { studentService } from '../../../lib/api-services'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import Pagination from '../../../components/ui/Pagination'
import { useAuth } from '../../../lib/auth-context'

export default function MyAttendancePage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({ total: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentService.getMyAttendance({ page, limit: 20 })
      setSummary(res.data?.summary || { total: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 })
      setRecords(res.data?.records || [])
      setTotalPages(res.pagination?.totalPages || 1)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

  const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    present: 'success',
    absent: 'danger',
    late: 'warning',
    excused: 'info',
  }

  // The backend returns full attendance entries — extract this student's record from each
  const studentId = (user as any)?.studentId
  const attendanceRows = records.map((entry: any) => {
    // If the backend already flattened the records, use directly; otherwise find this student
    const childRecord = entry.records
      ? (entry.records || []).find((r: any) => {
          const sid = r.student?._id || r.student
          return sid?.toString() === studentId
        })
      : entry
    return {
      _id: entry._id,
      date: entry.date,
      status: childRecord?.status || 'N/A',
      remark: childRecord?.remark || '',
    }
  })

  const { total, present: presentCount, absent: absentCount, late: lateCount, excused: excusedCount, attendanceRate } = summary

  if (loading && records.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Attendance' }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Days</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{presentCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{absentCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Late</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{lateCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Excused</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{excusedCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className={`text-2xl font-bold mt-1 ${attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {attendanceRate}%
          </p>
        </div>
      </div>

      {/* Records Table */}
      {attendanceRows.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">No attendance records found</div>
        </Card>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceRows.map((row) => (
                  <tr key={row._id}>
                    <td className="px-5 py-3">{formatDate(row.date)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariants[row.status] || 'default'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{row.remark || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} total={summary.total} pageSize={20} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
