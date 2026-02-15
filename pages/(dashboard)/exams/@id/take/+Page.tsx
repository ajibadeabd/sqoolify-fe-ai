import { useState, useEffect, useRef, useCallback } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { examService } from '../../../../../lib/api-services'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import ConfirmDialog from '../../../../../components/ui/ConfirmDialog'
import type { Question } from '../../../../../lib/types'

export default function TakeExamPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [tabViolations, setTabViolations] = useState(0)
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const violationRef = useRef(0)

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await examService.getById(id)
        setExam(res.data)
      } catch {
        toast.error('Failed to load exam')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchExam()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [id])

  const startExam = async () => {
    try {
      const res = await examService.startExam(id)
      const data = res.data as any
      setQuestions(data.questions || [])
      setStarted(true)
      // Calculate remaining time from server data
      if (data.attempt?.startedAt && exam?.duration) {
        const startedAt = new Date(data.attempt.startedAt).getTime()
        const durationMs = exam.duration * 60 * 1000
        const remaining = Math.max(0, Math.floor((startedAt + durationMs - Date.now()) / 1000))
        setTimeLeft(remaining)
      }
      // Prefill existing answers if resuming
      if (data.answers && Array.isArray(data.answers)) {
        const existing: Record<string, string> = {}
        data.answers.forEach((a: any) => {
          const qId = typeof a.question === 'object' ? a.question._id : a.question
          if (a.answer) existing[qId] = a.answer
        })
        setAnswers(existing)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start exam')
    }
  }

  // Countdown timer
  useEffect(() => {
    if (!started || timeLeft == null) return
    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev == null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [started, timeLeft == null])

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && started) {
      handleSubmit(true)
    }
  }, [timeLeft])

  // Anti-cheat: detect tab switches, prevent copy/paste/right-click
  useEffect(() => {
    if (!started) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationRef.current += 1
        setTabViolations(violationRef.current)
        setShowViolationWarning(true)
        toast.error(`Warning: You left the exam tab! (${violationRef.current} violation${violationRef.current > 1 ? 's' : ''})`)
        examService.reportViolation(id).catch(() => {})
        if (violationRef.current >= 3) {
          toast.error('Too many violations — exam will be auto-submitted')
          handleSubmit(true)
        }
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    const preventCopy = (e: Event) => {
      e.preventDefault()
      toast.warning('Copy/paste is disabled during exams')
    }

    const preventContextMenu = (e: Event) => {
      e.preventDefault()
    }

    const preventKeyShortcuts = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+U (view source), F12
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'u'].includes(e.key.toLowerCase())) {
        // Allow Ctrl+A and Ctrl+V in textareas for essay/short answer
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
        if ((e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'v') && (tag === 'textarea' || tag === 'input')) {
          return
        }
        e.preventDefault()
      }
      if (e.key === 'F12') {
        e.preventDefault()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('copy', preventCopy)
    document.addEventListener('cut', preventCopy)
    document.addEventListener('paste', preventCopy)
    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventKeyShortcuts)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('copy', preventCopy)
      document.removeEventListener('cut', preventCopy)
      document.removeEventListener('paste', preventCopy)
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventKeyShortcuts)
    }
  }, [started])

  // Debounced auto-save
  const saveAnswer = useCallback(
    (questionId: string, answer: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(async () => {
        try {
          await examService.saveAnswer(id, questionId, answer)
        } catch {
          // Silent fail for auto-save
        }
      }, 3000)
    },
    [id]
  )

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    saveAnswer(questionId, answer)
  }

  const handleSubmit = async (auto = false) => {
    if (submitting) return
    setSubmitting(true)
    setSubmitOpen(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    try {
      // Save all current answers before submitting
      const savePromises = Object.entries(answers).map(([questionId, answer]) =>
        examService.saveAnswer(id, questionId, answer).catch(() => {})
      )
      await Promise.all(savePromises)
      await examService.submitExam(id)
      toast.success(auto ? 'Time expired — exam submitted automatically' : 'Exam submitted successfully')
      await navigate(`/exams/${id}/review`)
    } catch {
      toast.error('Failed to submit exam')
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
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

  // Pre-start screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card>
          <div className="text-center space-y-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Subject</p>
                <p className="font-medium">{typeof exam.subject === 'object' ? exam.subject.name : '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">{exam.duration ? `${exam.duration} minutes` : 'No limit'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Max Score</p>
                <p className="font-medium">{exam.maxScore}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Type</p>
                <p className="font-medium">{exam.type}</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <p className="font-medium mb-1">Important</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Once started, the timer cannot be paused</li>
                <li>Your answers are auto-saved periodically</li>
                <li>The exam will auto-submit when time expires</li>
                <li>You can navigate freely between questions</li>
                <li>Do NOT switch tabs or leave this page — violations are tracked</li>
                <li>Copy, paste, and right-click are disabled during the exam</li>
                <li>3 tab violations will auto-submit your exam</li>
              </ul>
            </div>
            <Button size="lg" onClick={startExam}>Start Exam</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Exam interface
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).filter((qId) =>
    questions.some((q) => q._id === qId) && answers[qId]
  ).length
  const isUrgent = timeLeft != null && timeLeft < 300 // less than 5 minutes

  return (
    <div className="space-y-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">{exam.name}</h2>
            <span className="text-sm text-gray-500">
              {answeredCount}/{questions.length} answered
            </span>
            {tabViolations > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {tabViolations} violation{tabViolations > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {timeLeft != null && (
              <div className={`text-lg font-mono font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
            )}
            <Button
              variant="primary"
              onClick={() => setSubmitOpen(true)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </div>
        </div>

        {/* Question Navigation Pills */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q._id!]
            const isCurrent = i === currentIndex
            return (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Violation Warning */}
      {showViolationWarning && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="font-medium">
              {tabViolations} tab violation{tabViolations > 1 ? 's' : ''} detected.
              {tabViolations >= 2 ? ' One more will auto-submit your exam!' : ' Stay on this page.'}
            </span>
          </div>
          <button onClick={() => setShowViolationWarning(false)} className="text-red-400 hover:text-red-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Question Display */}
      {currentQuestion && (
        <Card>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                  {currentQuestion.type?.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-lg font-medium text-gray-900">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <p className="mt-2 text-gray-800">{currentQuestion.questionText}</p>
            </div>

            {/* MCQ Options */}
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = answers[currentQuestion._id!] === opt
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion._id}`}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(currentQuestion._id!, opt)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">
                        {String.fromCharCode(65 + i)}. {opt}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

            {/* True/False */}
            {currentQuestion.type === 'true_false' && (
              <div className="flex gap-3">
                {['True', 'False'].map((val) => {
                  const isSelected = answers[currentQuestion._id!] === val
                  return (
                    <button
                      key={val}
                      onClick={() => handleAnswerChange(currentQuestion._id!, val)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Short Answer / Essay */}
            {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
              <textarea
                rows={currentQuestion.type === 'essay' ? 8 : 3}
                value={answers[currentQuestion._id!] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id!, e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={currentQuestion.type === 'essay' ? 'Write your essay here...' : 'Type your answer...'}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onConfirm={() => handleSubmit(false)}
        title="Submit Exam"
        message={`You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit? You cannot make changes after submission.`}
        loading={submitting}
      />
    </div>
  )
}
