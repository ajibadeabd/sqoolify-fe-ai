import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { examService } from '../../../../../lib/api-services'
import Card from '../../../../../components/ui/Card'
import Button from '../../../../../components/ui/Button'
import Badge from '../../../../../components/ui/Badge'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../../components/ui/ConfirmDialog'
import type { ExamAttempt, StudentAnswer } from '../../../../../lib/types'

export default function GradingPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [exam, setExam] = useState<any>(null)
  const [submissions, setSubmissions] = useState<ExamAttempt[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<StudentAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAnswers, setLoadingAnswers] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [grades, setGrades] = useState<Record<string, { score: string; feedback: string }>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, subsRes] = await Promise.all([
          examService.getById(id),
          examService.getSubmissions(id),
        ])
        setExam(examRes.data)
        setSubmissions(subsRes.data || [])
      } catch {
        toast.error('Failed to load exam data')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  const loadStudentAnswers = async (studentId: string) => {
    setSelectedStudentId(studentId)
    setLoadingAnswers(true)
    try {
      const res = await examService.getStudentSubmission(id, studentId)
      const ans: StudentAnswer[] = res.data.answers || []
      setAnswers(ans)
      // Initialize grade inputs from existing data
      const initial: Record<string, { score: string; feedback: string }> = {}
      ans.forEach((a) => {
        initial[a.question as string] = {
          score: a.score != null ? String(a.score) : '',
          feedback: a.feedback || '',
        }
      })
      setGrades(initial)
    } catch {
      toast.error('Failed to load student answers')
    } finally {
      setLoadingAnswers(false)
    }
  }

  const handleGrade = async (questionId: string) => {
    const grade = grades[questionId]
    if (!grade || grade.score === '') return
    setSaving(true)
    try {
      await examService.gradeAnswer(id, {
        studentId: selectedStudentId!,
        questionId,
        score: Number(grade.score),
        feedback: grade.feedback || undefined,
      })
      toast.success('Grade saved')
      // Update answer status locally
      setAnswers((prev) =>
        prev.map((a) =>
          (a.question as string) === questionId || (a.question as any)?._id === questionId
            ? { ...a, score: Number(grade.score), feedback: grade.feedback, status: 'graded' as const }
            : a
        )
      )
    } catch {
      toast.error('Failed to save grade')
    } finally {
      setSaving(false)
    }
  }

  const handleFinalizeGrades = async () => {
    setFinalizing(true)
    try {
      await examService.finalizeGrades(id)
      toast.success('Grades finalized and scores created')
      // Refresh submissions
      const subsRes = await examService.getSubmissions(id)
      setSubmissions(subsRes.data || [])
      setFinalizeOpen(false)
    } catch {
      toast.error('Failed to finalize grades')
    } finally {
      setFinalizing(false)
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

  const statusColors: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
    in_progress: 'warning',
    submitted: 'info',
    graded: 'success',
  }

  const getStudentName = (sub: ExamAttempt) => {
    const student = typeof sub.student === 'object' ? sub.student as any : null
    const user = student?.user && typeof student.user === 'object' ? student.user : null
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown'
  }

  const getQuestionFromAnswer = (answer: StudentAnswer) => {
    return typeof answer.question === 'object' ? answer.question as any : null
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Exams', href: '/exams' },
        { label: exam.name, href: `/exams/${id}` },
        { label: 'Grade' },
      ]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Grade: {exam.name}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/exams/${id}`)}>Back</Button>
          <Button variant="primary" onClick={() => setFinalizeOpen(true)}>
            Finalize All Grades
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Student List Sidebar */}
        <Card title={`Students (${submissions.length})`}>
          {submissions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No submissions yet</p>
          ) : (
            <div className="divide-y divide-gray-100 -mx-4 sm:-mx-6">
              {submissions.map((sub) => {
                const studentId = typeof sub.student === 'object' ? (sub.student as any)._id : sub.student
                const isSelected = selectedStudentId === studentId
                return (
                  <button
                    key={sub._id}
                    onClick={() => loadStudentAnswers(studentId)}
                    className={`w-full text-left px-4 sm:px-6 py-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{getStudentName(sub)}</span>
                      <Badge variant={statusColors[sub.status] || 'default'} size="sm">
                        {sub.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {sub.totalScore != null && (
                      <p className="text-xs text-gray-500 mt-1">
                        Score: {sub.totalScore}/{exam.maxScore}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Grading Area */}
        <div className="space-y-4">
          {!selectedStudentId ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">Select a student from the list to view and grade their answers</p>
              </div>
            </Card>
          ) : loadingAnswers ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          ) : answers.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">No answers found for this student</p>
              </div>
            </Card>
          ) : (
            answers.map((answer, index) => {
              const question = getQuestionFromAnswer(answer)
              const questionId = question?._id || (answer.question as string)
              const isAutoGraded = question?.type === 'mcq' || question?.type === 'true_false'
              const grade = grades[questionId] || { score: '', feedback: '' }

              return (
                <Card key={answer._id || index}>
                  <div className="space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                            {question?.type?.replace('_', ' ') || 'Question'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {question?.points || 0} point{question?.points !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Q{index + 1}. {question?.questionText || 'Question text unavailable'}
                        </p>
                      </div>
                      {answer.status === 'graded' && (
                        <Badge variant="success" size="sm">Graded</Badge>
                      )}
                    </div>

                    {/* MCQ Options (for context) */}
                    {question?.type === 'mcq' && question.options && (
                      <div className="space-y-1 pl-4">
                        {question.options.map((opt: string, i: number) => (
                          <p key={i} className={`text-sm ${opt === question.correctAnswer ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                            {String.fromCharCode(65 + i)}. {opt} {opt === question.correctAnswer ? '(correct)' : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Student's Answer */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs text-gray-500 block mb-1">Student's Answer</label>
                      <p className="text-sm text-gray-900">
                        {answer.answer || <span className="text-gray-400 italic">No answer provided</span>}
                      </p>
                      {isAutoGraded && answer.isCorrect != null && (
                        <p className={`text-xs mt-1 ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </p>
                      )}
                    </div>

                    {/* Grading Section */}
                    {isAutoGraded ? (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Auto-graded:</span>
                        <span className="font-medium">
                          {answer.score ?? 0}/{question?.points || 0}
                        </span>
                      </div>
                    ) : (
                      <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center gap-4">
                          <label className="text-sm text-gray-600 whitespace-nowrap">Score:</label>
                          <input
                            type="number"
                            min={0}
                            max={question?.points || 100}
                            value={grade.score}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [questionId]: { ...prev[questionId], score: e.target.value },
                              }))
                            }
                            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">/ {question?.points || 0}</span>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Feedback (optional)</label>
                          <textarea
                            rows={2}
                            value={grade.feedback}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [questionId]: { ...prev[questionId], feedback: e.target.value },
                              }))
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            placeholder="Add feedback for the student..."
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleGrade(questionId)}
                          disabled={saving || grade.score === ''}
                        >
                          {saving ? 'Saving...' : 'Save Grade'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        open={finalizeOpen}
        onClose={() => setFinalizeOpen(false)}
        onConfirm={handleFinalizeGrades}
        title="Finalize Grades"
        message="This will aggregate all student scores and create official score records. Make sure all essays and short answers have been graded before finalizing."
        loading={finalizing}
      />
    </div>
  )
}
