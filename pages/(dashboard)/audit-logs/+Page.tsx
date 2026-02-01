import { useState, useEffect } from 'react'
import { auditLogService } from '../../../lib/api-services'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import { formatDistanceToNow } from 'date-fns'

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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(50)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [limit])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await auditLogService.getAll({ limit })
      setLogs(res.data || [])
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

    // Extract permissions changes
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

    // Extract role changes
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

  if (loading) {
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
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value={25}>25 logs</option>
            <option value={50}>50 logs</option>
            <option value={100}>100 logs</option>
            <option value={200}>200 logs</option>
          </select>
        </div>
      </div>

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
                          {log.performedBy.firstName} {log.performedBy.lastName}
                        </span>
                        <span className="text-gray-500 ml-1">({log.performedBy.email})</span>
                        {log.targetUser && (
                          <>
                            <span className="mx-2">→</span>
                            <span className="font-medium">
                              {log.targetUser.firstName} {log.targetUser.lastName}
                            </span>
                            <span className="text-gray-500 ml-1">({log.targetUser.email})</span>
                          </>
                        )}
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
        </Card>
      )}
    </div>
  )
}
