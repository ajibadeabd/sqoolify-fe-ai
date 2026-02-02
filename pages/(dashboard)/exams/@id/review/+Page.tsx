import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { examService } from '../../../../../lib/api-services'
import Card from '../../../../../components/ui/Card'
import Button from '../../../../../components/ui/Button'
import Badge from '../../../../../components/ui/Badge'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function ExamReviewPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [exam, setExam] = useState<any>(null)
  const [attempt, setAttempt] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examRes = await examService.getById(id)
        setExam(examRes.data)

        // Start exam returns attempt + answers for already-submitted exams too
        const startRes = await examService.startExam(id)
        const data = startRes.data
        setAttempt(data.attempt)
        setAnswers(data.answers || [])
      } catch (err: any) {
        // If exam already submitted, try to get submission data via the start endpoint
        // The backend should return the attempt/answers even if submitted
        toast.error(err?.response?.data?.message || 'Failed to load review data')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

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

  const isGraded = attempt?.status === 'graded'
  const isSubmitted = attempt?.status === 'submitted' || isGraded

  const getQuestion = (answer: any) => {
    return typeof answer.question === 'object' ? answer.question : null
  }

  const totalEarned = answers.reduce((sum: number, a: any) => sum + (a.score ?? 0), 0)
  const totalPossible = answers.reduce((sum: number, a: any) => {
    const q = getQuestion(a)
    return sum + (q?.points || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Exams', href: '/exams' },
        { label: exam.name, href: `/exams/${id}` },
        { label: 'Review' },
      ]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exam Review</h1>
        <Button variant="outline" onClick={() => navigate('/exams')}>Back to Exams</Button>
      </div>

      {/* Summary Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{exam.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {typeof exam.subject === 'object' ? exam.subject.name : ''} &bull; {exam.type}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isGraded ? 'success' : isSubmitted ? 'info' : 'warning'}>
              {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'In Progress'}
            </Badge>
            {isGraded && (
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{totalEarned}<span className="text-lg text-gray-400">/{totalPossible}</span></p>
                <p className="text-xs text-gray-500">
                  {totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0}%
                </p>
              </div>
            )}
            {isSubmitted && !isGraded && (
              <p className="text-sm text-gray-500">Awaiting grading</p>
            )}
          </div>
        </div>
        {attempt?.timeSpent && (
          <p className="text-sm text-gray-500 mt-3 border-t pt-3">
            Time spent: {Math.round(attempt.timeSpent / 60)} minutes
          </p>
        )}
      </Card>

      {/* Answers */}
      {answers.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No answers found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {answers.map((answer: any, index: number) => {
            const question = getQuestion(answer)
            const hasScore = answer.score != null
            const isCorrect = answer.isCorrect

            return (
              <Card key={answer._id || index}>
                <div className="space-y-4">
                  {/* Question */}
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
                    {hasScore && (
                      <div className="text-right ml-4">
                        <span className={`text-lg font-bold ${
                          answer.score === question?.points ? 'text-green-600' :
                          answer.score === 0 ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {answer.score}
                        </span>
                        <span className="text-sm text-gray-400">/{question?.points || 0}</span>
                      </div>
                    )}
                  </div>

                  {/* MCQ Options */}
                  {question?.type === 'mcq' && question.options && (
                    <div className="space-y-1.5 pl-4">
                      {question.options.map((opt: string, i: number) => {
                        const isStudentAnswer = answer.answer === opt
                        const isCorrectAnswer = question.correctAnswer === opt
                        let optClass = 'text-gray-600'
                        if (isGraded && isCorrectAnswer) optClass = 'text-green-700 font-medium'
                        if (isGraded && isStudentAnswer && !isCorrectAnswer) optClass = 'text-red-600 line-through'
                        if (!isGraded && isStudentAnswer) optClass = 'text-blue-700 font-medium'

                        return (
                          <p key={i} className={`text-sm ${optClass}`}>
                            {String.fromCharCode(65 + i)}. {opt}
                            {isStudentAnswer && ' (your answer)'}
                            {isGraded && isCorrectAnswer && ' (correct)'}
                          </p>
                        )
                      })}
                    </div>
                  )}

                  {/* True/False display */}
                  {question?.type === 'true_false' && (
                    <div className="pl-4 text-sm">
                      <p>Your answer: <span className={`font-medium ${
                        isGraded ? (isCorrect ? 'text-green-700' : 'text-red-600') : 'text-blue-700'
                      }`}>{answer.answer || '-'}</span></p>
                      {isGraded && !isCorrect && (
                        <p className="text-green-700">Correct answer: {question.correctAnswer}</p>
                      )}
                    </div>
                  )}

                  {/* Essay / Short Answer */}
                  {(question?.type === 'short_answer' || question?.type === 'essay') && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-xs text-gray-500 block mb-1">Your Answer</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {answer.answer || <span className="text-gray-400 italic">No answer provided</span>}
                      </p>
                    </div>
                  )}

                  {/* Correctness indicator for auto-graded */}
                  {isGraded && (question?.type === 'mcq' || question?.type === 'true_false') && (
                    <p className={`text-xs ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </p>
                  )}

                  {/* Feedback */}
                  {answer.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <label className="text-xs text-blue-600 font-medium block mb-1">Teacher Feedback</label>
                      <p className="text-sm text-blue-900">{answer.feedback}</p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
