import { useState, useEffect } from 'react'
import { auditLogService } from '../../../lib/api-services'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import { formatDistanceToNow } from 'date-fns'

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'CREATE_USER', label: 'Create User' },
  { value: 'DELETE_USER', label: 'Delete User' },
  { value: 'UPDATE_PERMISSIONS', label: 'Update Permissions' },
  { value: 'UPDATE_ROLE', label: 'Update Role' },
]

interface AuditLog {
  _id: string
  action: string
  performedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  targetUser?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  changes?: {
    before?: any
    after?: any
  }
  ipAddress?: string
  userAgent?: string
  createdAt: string
  metadata?: Record<string, any>
}

interface Pagination {
  total: number
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [actionFilter, setActionFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [page, limit, actionFilter, startDate, endDate])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (actionFilter) params.action = actionFilter
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const res = await auditLogService.getAll(params)
      setLogs(res.data || [])
      setPagination((res as any).pagination || null)
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATE')) return 'success'
    if (action.includes('DELETE')) return 'danger'
    if (action.includes('UPDATE')) return 'warning'
    if (action.includes('LOGIN')) return 'info'
    if (action.includes('LOGOUT')) return 'default'
    return 'default'
  }

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const renderChanges = (changes: AuditLog['changes']) => {
    if (!changes) return null

    const { before, after } = changes

    if (before?.permissions && after?.permissions) {
      const beforePerms = before.permissions || []
      const afterPerms = after.permissions || []
      const added = afterPerms.filter((p: string) => !beforePerms.includes(p))
      const removed = beforePerms.filter((p: string) => !afterPerms.includes(p))

      return (
        <div className="mt-2 space-y-2 text-sm">
          {added.length > 0 && (
            <div>
              <span className="font-medium text-green-700">Added Permissions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {added.map((p: string) => (
                  <span key={p} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          {removed.length > 0 && (
            <div>
              <span className="font-medium text-red-700">Removed Permissions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {removed.map((p: string) => (
                  <span key={p} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (before?.role !== after?.role && after?.role) {
      return (
        <div className="mt-2 text-sm">
          <span className="font-medium">Role changed:</span>
          <span className="ml-2">
            <span className="text-gray-500">{before?.role || 'None'}</span>
            {' → '}
            <span className="text-blue-600 font-medium">{after.role}</span>
          </span>
        </div>
      )
    }

    return null
  }

  const renderMetadata = (log: AuditLog) => {
    if (!log.metadata) return null
    if (log.metadata.role) {
      return (
        <span className="text-sm text-gray-500 ml-2">
          (role: <span className="capitalize">{log.metadata.role}</span>)
        </span>
      )
    }
    return null
  }

  if (loading && logs.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Audit Logs' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system changes and user actions</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              {ACTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per page</label>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          {(actionFilter || startDate || endDate) && (
            <button
              onClick={() => { setActionFilter(''); setStartDate(''); setEndDate(''); setPage(1) }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {logs.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            No audit logs found
          </div>
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log._id}
                className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {formatAction(log.action)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">
                          {log.performedBy?.firstName} {log.performedBy?.lastName}
                        </span>
                        <span className="text-gray-500 ml-1">({log.performedBy?.email})</span>
                        {log.targetUser && (
                          <>
                            <span className="mx-2">→</span>
                            <span className="font-medium">
                              {log.targetUser.firstName} {log.targetUser.lastName}
                            </span>
                            <span className="text-gray-500 ml-1">({log.targetUser.email})</span>
                          </>
                        )}
                        {renderMetadata(log)}
                      </p>

                      {renderChanges(log.changes)}

                      {expandedLog === log._id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            {log.ipAddress && (
                              <div>
                                <span className="font-medium text-gray-600">IP Address:</span>
                                <p className="text-gray-700 mt-1">{log.ipAddress}</p>
                              </div>
                            )}
                            {log.userAgent && (
                              <div>
                                <span className="font-medium text-gray-600">User Agent:</span>
                                <p className="text-gray-700 mt-1 break-all">{log.userAgent}</p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-600">Timestamp:</span>
                              <p className="text-gray-700 mt-1">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Log ID:</span>
                              <p className="text-gray-700 mt-1 font-mono">{log._id}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                    className="text-sm text-blue-600 hover:text-blue-700 ml-4"
                  >
                    {expandedLog === log._id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
