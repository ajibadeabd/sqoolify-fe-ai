import { useState, useEffect } from 'react'
import { useAuditLogStore } from '../../../lib/stores/audit-log-store'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'
import { formatDistanceToNow } from 'date-fns'

const ACTION_GROUPS = [
  {
    label: 'Authentication',
    options: [
      { value: 'LOGIN', label: 'Login' },
      { value: 'LOGIN_FAILED', label: 'Login Failed' },
      { value: 'LOGOUT', label: 'Logout' },
      { value: 'PASSWORD_CHANGED', label: 'Password Changed' },
      { value: 'PASSWORD_RESET_REQUESTED', label: 'Password Reset' },
    ],
  },
  {
    label: 'User Management',
    options: [
      { value: 'CREATE_USER', label: 'Create User' },
      { value: 'UPDATE_USER', label: 'Update User' },
      { value: 'DELETE_USER', label: 'Delete User' },
      { value: 'UPDATE_PERMISSIONS', label: 'Update Permissions' },
      { value: 'UPDATE_ROLE', label: 'Update Role' },
    ],
  },
  {
    label: 'Exams & Results',
    options: [
      { value: 'CREATE_EXAM', label: 'Create Exam' },
      { value: 'DELETE_EXAM', label: 'Delete Exam' },
      { value: 'GRADE_EDITED', label: 'Grade Edited' },
      { value: 'RESULTS_UPLOADED', label: 'Results Uploaded' },
      { value: 'RESULT_PUBLISHED', label: 'Result Published' },
      { value: 'RESULT_UNPUBLISHED', label: 'Result Unpublished' },
      { value: 'REPORT_CARD_GENERATED', label: 'Report Card Generated' },
    ],
  },
  {
    label: 'Finance',
    options: [
      { value: 'CREATE_FEE', label: 'Create Fee' },
      { value: 'DELETE_FEE', label: 'Delete Fee' },
      { value: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
      { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
      { value: 'BANK_ADDED', label: 'Bank Added' },
      { value: 'BANK_DELETED', label: 'Bank Deleted' },
      { value: 'SUBSCRIPTION_UPGRADED', label: 'Subscription Upgraded' },
      { value: 'SUBSCRIPTION_DOWNGRADED', label: 'Subscription Downgraded' },
      { value: 'SUBSCRIPTION_CANCELLED', label: 'Subscription Cancelled' },
    ],
  },
  {
    label: 'Data & Security',
    options: [
      { value: 'DATA_EXPORTED', label: 'Data Exported' },
      { value: 'BULK_DELETE', label: 'Bulk Delete' },
      { value: 'SETTINGS_CHANGED', label: 'Settings Changed' },
      { value: 'SCHOOL_CREATED', label: 'School Created' },
    ],
  },
  {
    label: 'Communication',
    options: [
      { value: 'NOTICE_CREATED', label: 'Notice Created' },
      { value: 'NOTICE_DELETED', label: 'Notice Deleted' },
    ],
  },
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

export default function AuditLogsPage() {
  const {
    logs, loading, pagination, filters,
    fetchLogs, setFilter, resetFilters, invalidate,
  } = useAuditLogStore()

  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('FAILED') || action.includes('DELETE') || action.includes('CANCELLED') || action === 'BULK_DELETE') return 'danger'
    if (action.includes('CREATE') || action.includes('ADDED') || action === 'PAYMENT_COMPLETED') return 'success'
    if (action.includes('UPDATE') || action.includes('CHANGED') || action.includes('EDITED')) return 'warning'
    if (action.includes('LOGIN') || action.includes('PUBLISHED') || action.includes('UPGRADED')) return 'info'
    if (action.includes('DOWNGRADED') || action.includes('EXPORTED')) return 'warning'
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

  const getActionDescription = (log: AuditLog): string | null => {
    const m = log.metadata || {}

    switch (log.action) {
      case 'LOGIN':
        return `Logged in${log.ipAddress ? ` from ${log.ipAddress}` : ''}`
      case 'LOGIN_FAILED':
        return `Failed login attempt${log.ipAddress ? ` from ${log.ipAddress}` : ''}`
      case 'LOGOUT':
        return 'Logged out'
      case 'PASSWORD_CHANGED':
        return 'Changed their password'
      case 'PASSWORD_RESET_REQUESTED':
        return 'Requested a password reset'
      case 'CREATE_USER':
        return `Created ${m.role || 'user'}: ${m.firstName} ${m.lastName} (${m.email})${m.admissionNo ? ` - ${m.admissionNo}` : ''}${m.employeeId ? ` - ${m.employeeId}` : ''}`
      case 'DELETE_USER':
        return m.email ? `Deleted user: ${m.email}` : null
      case 'CREATE_FEE':
        return `Created fee${m.totalAmount ? ` - Total: ${formatCurrency(m.totalAmount)}` : ''}${m.termsCount ? ` (${m.termsCount} terms)` : ''}`
      case 'UPDATE_FEE':
        return `Updated fee${m.updatedFields ? `: ${m.updatedFields.join(', ')}` : ''}`
      case 'DELETE_FEE':
        return `Deleted fee${m.termsCount ? ` (${m.termsCount} terms)` : ''}`
      case 'PAYMENT_COMPLETED':
        return `Payment of ${formatCurrency(m.amount)} completed${m.source === 'webhook' ? ' (via webhook)' : ''} - Ref: ${m.reference}`
      case 'PAYMENT_FAILED':
        return `Payment of ${formatCurrency(m.amount)} failed - Ref: ${m.reference}`
      case 'GRADE_EDITED':
        return `Graded answer: ${m.score} points${m.feedback ? ` - "${m.feedback}"` : ''}`
      case 'RESULTS_UPLOADED':
        return `Finalized grades for exam${m.scoresCount ? ` (${m.scoresCount} scores)` : ''}`
      case 'RESULT_PUBLISHED':
        return `Published exam: ${m.examName || m.examId}`
      case 'RESULT_UNPUBLISHED':
        return `Unpublished exam: ${m.examName || m.examId}`
      case 'DELETE_EXAM':
        return `Deleted exam: ${m.name || m.examId}`
      case 'BANK_ADDED':
        return `Added bank: ${m.accountName || ''} - ${m.bankCode || ''}`
      case 'BANK_DELETED':
        return `Deleted bank account`
      case 'NOTICE_CREATED':
        return `Created notice: "${m.title}"${m.visibility ? ` (${m.visibility})` : ''}`
      case 'NOTICE_DELETED':
        return `Deleted notice: "${m.title || m.noticeId}"`
      case 'SETTINGS_CHANGED':
        return `Updated settings: ${m.updatedFields?.join(', ') || 'school configuration'}`
      case 'SUBSCRIPTION_CANCELLED':
        return `Scheduled subscription cancellation`
      case 'SUBSCRIPTION_UPGRADED':
        return `Upgraded subscription`
      case 'SUBSCRIPTION_DOWNGRADED':
        return `Scheduled subscription downgrade`
      case 'SCHOOL_CREATED':
        return `Created school: ${m.schoolName || ''}`
      case 'DATA_EXPORTED':
        return `Exported ${m.exportType || 'data'}`
      case 'BULK_DELETE':
        return `Bulk deleted ${m.count || ''} ${m.type || 'records'}`
      default:
        if (m.role) return `Role: ${m.role}`
        return null
    }
  }

  const parseUserAgent = (ua: string): string => {
    if (!ua) return 'Unknown'

    let browser = 'Unknown Browser'
    if (ua.includes('Edg/')) browser = 'Edge'
    else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera'
    else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome'
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari'
    else if (ua.includes('Firefox/')) browser = 'Firefox'

    let os = 'Unknown OS'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'Mac'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
    else if (ua.includes('Linux')) os = 'Linux'

    let device = ''
    if (ua.includes('Mobile') || ua.includes('Android')) device = ' (Mobile)'
    else if (ua.includes('iPad') || ua.includes('Tablet')) device = ' (Tablet)'

    return `${browser} on ${os}${device}`
  }

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return ''
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
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
              value={filters.action}
              onChange={(e) => setFilter('action', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">All Actions</option>
              {ACTION_GROUPS.map(group => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilter('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilter('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per page</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilter('limit', Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          {(filters.action || filters.startDate || filters.endDate) && (
            <button
              onClick={resetFilters}
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
                      </p>

                      {getActionDescription(log) && (
                        <p className="text-sm text-gray-600 mt-1">{getActionDescription(log)}</p>
                      )}

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
                                <span className="font-medium text-gray-600">Device:</span>
                                <p className="text-gray-700 mt-1">{parseUserAgent(log.userAgent)}</p>
                                <p className="text-gray-400 mt-1 break-all text-[10px]">{log.userAgent}</p>
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
                  onClick={() => setFilter('page', filters.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilter('page', filters.page + 1)}
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
