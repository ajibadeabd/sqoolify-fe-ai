import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { examService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import { usePermission } from '../../../../lib/use-permission'

export default function ExamDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const [exam, setExam] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await examService.getById(id)
        setExam(res.data)

        // Also fetch scores
        try {
          const scoresRes = await examService.getScores(id)
          setScores(scoresRes.data || [])
        } catch {
          // Scores may not exist yet
        }
      } catch {
        setExam(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchExam()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await examService.delete(id)
      toast.success('Exam deleted')
      await navigate('/exams')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!exam) {
    return <div className="text-center py-12 text-gray-500">Exam not found</div>
  }

  const cls = typeof exam.class === 'object' ? exam.class : null
  const subject = typeof exam.subject === 'object' ? exam.subject : null
  const session = typeof exam.session === 'object' ? exam.session : null

  const formatDate = (date: string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const typeColors: Record<string, string> = {
    CA1: 'bg-blue-100 text-blue-700',
    CA2: 'bg-indigo-100 text-indigo-700',
    Exam: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Exams', href: '/exams' }, { label: exam.name }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exam Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/exams')}>Back</Button>
          {can('write_exams') && <Button variant="primary" onClick={() => navigate(`/exams/${id}/edit`)}>Edit</Button>}
          {can('grade_exams') && <Button onClick={() => navigate(`/exams/${id}/scores`)}>Enter Scores</Button>}
          {can('delete_exams') && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
        </div>
      </div>

      {/* Exam Info */}
      <Card title="Exam Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="font-medium">{exam.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Type</label>
            <p>
              <span className={`px-2 py-1 text-xs rounded-full ${typeColors[exam.type] || 'bg-gray-100 text-gray-700'}`}>
                {exam.type}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Max Score</label>
            <p className="font-medium">{exam.maxScore}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Class</label>
            <p className="font-medium">{cls?.name || '-'}{cls?.section ? ` - ${cls.section}` : ''}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Subject</label>
            <p className="font-medium">{subject?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Term</label>
            <p className="font-medium">Term {exam.term || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Session</label>
            <p className="font-medium">{session?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Date</label>
            <p className="font-medium">{formatDate(exam.date)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Created</label>
            <p className="font-medium">{formatDate(exam.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* Scores Summary */}
      <Card title={`Scores (${scores.length})`}>
        {scores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-3">No scores recorded yet</p>
            {can('grade_exams') && (
              <Button onClick={() => navigate(`/exams/${id}/scores`)}>Enter Scores</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">#</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Score</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scores.map((score: any, index: number) => {
                  const studentUser = typeof score.student === 'object' ? score.student?.user : null
                  const studentName = studentUser && typeof studentUser === 'object'
                    ? `${studentUser.firstName} ${studentUser.lastName}`
                    : 'Unknown'
                  const percentage = exam.maxScore ? Math.round((score.score / exam.maxScore) * 100) : 0

                  return (
                    <tr key={score._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{studentName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-medium">{score.score}</span>
                        <span className="text-gray-400">/{exam.maxScore}</span>
                        <span className="ml-2 text-gray-500">({percentage}%)</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          percentage >= 70 ? 'success' :
                          percentage >= 50 ? 'warning' :
                          'danger'
                        }>
                          {score.grade || '-'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {scores.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
                Average: <span className="font-medium">
                  {(scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length).toFixed(1)}
                </span>/{exam.maxScore}
                &nbsp;&bull;&nbsp;
                Highest: <span className="font-medium">{Math.max(...scores.map((s: any) => s.score))}</span>
                &nbsp;&bull;&nbsp;
                Lowest: <span className="font-medium">{Math.min(...scores.map((s: any) => s.score))}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Exam"
        message={`Are you sure you want to delete "${exam.name}"? All associated scores will also be removed. This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
