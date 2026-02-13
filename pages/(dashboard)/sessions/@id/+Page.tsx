import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { sessionService } from '../../../../lib/api-services'
import type { Session } from '../../../../lib/types'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import Badge from '../../../../components/ui/Badge'
import { usePermission } from '../../../../lib/use-permission'
import { getTermColorByName } from '../../../../lib/term-utils'

export default function SessionDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [settingCurrent, setSettingCurrent] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchSession = async () => {
      setLoading(true)
      try {
        const res = await sessionService.getById(id)
        setSession(res.data)
      } catch (err: any) {
        toast.error(err.message || 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this session?')) return
    setDeleting(true)
    try {
      await sessionService.delete(id)
      toast.success('Session deleted')
      await navigate('/sessions')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete session')
      setDeleting(false)
    }
  }

  const handleSetCurrent = async () => {
    setSettingCurrent(true)
    try {
      await sessionService.setCurrent(id)
      const res = await sessionService.getById(id)
      setSession(res.data)
      toast.success('Session set as current')
    } catch (err: any) {
      toast.error(err.message || 'Failed to set current session')
    } finally {
      setSettingCurrent(false)
    }
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return null
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} weeks (${diffDays} days)`
  }

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Sessions', href: '/sessions' }, { label: 'Loading...' }]} />
        <Card>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading session...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Sessions', href: '/sessions' }, { label: 'Not Found' }]} />
        <Card>
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Session not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/sessions')}>
              Back to Sessions
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sessions', href: '/sessions' }, { label: session.name }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
              {session.isCurrent && <Badge variant="success">Current</Badge>}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(session.startDate)} - {formatDate(session.endDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/sessions')}>Back</Button>
          {can('write_sessions') && (
            <Button variant="primary" onClick={() => navigate(`/sessions/${id}/edit`)}>Edit</Button>
          )}
          {can('write_sessions') && !session.isCurrent && (
            <Button variant="primary" onClick={handleSetCurrent} loading={settingCurrent}>
              Set as Current
            </Button>
          )}
          {can('delete_sessions') && !session.isCurrent && (
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Session Details</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(session.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(session.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">
                  {calculateDuration(session.startDate, session.endDate) || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {session.isCurrent ? (
                    <Badge variant="success">Current Session</Badge>
                  ) : (
                    <span className="text-gray-600">Inactive</span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {session.terms && session.terms.length > 0 && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                Terms ({session.terms.length})
              </h3>
              <div className="space-y-4">
                {session.terms.map((term, index) => {
                  const colors = getTermColorByName(term.name)
                  return (
                    <div key={index} className={`border-2 rounded-xl p-4 ${colors.border} ${colors.bg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 ${colors.badge} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className={`font-semibold ${colors.text}`}>{term.name} Term</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(term.startDate)} - {formatDate(term.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {calculateDuration(term.startDate, term.endDate)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Terms</span>
                <span className="font-medium">{session.terms?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Current Term</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Term {session.currentTerm || 1}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <Badge variant={session.isCurrent ? 'success' : 'default'}>
                  {session.isCurrent ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
