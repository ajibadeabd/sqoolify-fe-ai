import { useState, useEffect, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { attendanceService } from '../../../../../lib/api-services'
import Card from '../../../../../components/ui/Card'
import Badge from '../../../../../components/ui/Badge'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import Pagination from '../../../../../components/ui/Pagination'

export default function ChildAttendancePage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id

  const [child, setChild] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({ total: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchAttendance = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await attendanceService.getChildAttendance(id, { page, limit: 20 })
      setChild(res.data?.child || null)
      setSummary(res.data?.summary || { total: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 })
      setRecords(res.data?.records || [])
      setTotalPages(res.pagination?.totalPages || 1)
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [id, page])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const childUser = child?.user || {}
  const childName = `${childUser.firstName || ''} ${childUser.lastName || ''}`.trim() || 'Child'

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

  const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    present: 'success',
    absent: 'danger',
    late: 'warning',
    excused: 'info',
  }

  // Extract the child's record from each attendance entry
  const attendanceRows = records.map((entry: any) => {
    const childRecord = (entry.records || []).find(
      (r: any) => (r.student?._id || r.student)?.toString() === id,
    )
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
      <Breadcrumbs items={[
        { label: 'My Children', href: '/my-children' },
        { label: childName, href: `/my-children/${id}` },
        { label: 'Attendance' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance — {childName}</h1>
          {child?.admissionNo && (
            <p className="text-sm text-gray-500 mt-1">Admission No: {child.admissionNo}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`/my-children/${id}`)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
        >
          Back
        </button>
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

      {/* Attendance Records */}
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