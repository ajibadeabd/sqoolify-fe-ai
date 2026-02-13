import { useState, useEffect, useCallback, useRef } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { examService } from '../../../../../lib/api-services'
import Button from '../../../../../components/ui/Button'
import Card from '../../../../../components/ui/Card'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'
import type { Exam, Question, QuestionType, CreateQuestionData } from '../../../../../lib/types'

const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'mcq', label: 'Multiple Choice', icon: 'A' },
  { value: 'true_false', label: 'True / False', icon: 'T' },
  { value: 'short_answer', label: 'Short Answer', icon: 'S' },
  { value: 'essay', label: 'Essay', icon: 'E' },
]

const EMPTY_QUESTION: CreateQuestionData = {
  type: 'mcq',
  questionText: '',
  points: 10,
  options: ['', '', '', ''],
  correctAnswer: '',
  markingScheme: '',
}

const CSV_TEMPLATE = `type,questionText,points,optionA,optionB,optionC,optionD,correctAnswer,markingScheme
mcq,"What is 2+2?",5,"3","4","5","6","4",""
true_false,"The earth is flat.",5,,,,,"False",""
short_answer,"Define photosynthesis.",10,,,,,,"Award marks for mentioning sunlight and CO2"
essay,"Discuss the causes of World War II.",20,,,,,,"Full marks for 3+ causes with explanations"`

function parseCsvToQuestions(file: File): Promise<CreateQuestionData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          const questions: CreateQuestionData[] = []
          const validTypes = ['mcq', 'true_false', 'short_answer', 'essay']

          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i] as Record<string, string>
            const rowNum = i + 2 // +2 for header row + 0-index

            const type = row.type?.trim()
            if (!type || !validTypes.includes(type)) {
              throw new Error(`Row ${rowNum}: Invalid type "${type}". Must be: mcq, true_false, short_answer, essay`)
            }

            const questionText = row.questionText?.trim()
            if (!questionText) {
              throw new Error(`Row ${rowNum}: questionText is required`)
            }

            const points = parseInt(row.points, 10)
            if (isNaN(points) || points < 1) {
              throw new Error(`Row ${rowNum}: Invalid points "${row.points}"`)
            }

            const question: CreateQuestionData = {
              type: type as QuestionType,
              questionText,
              points,
            }

            if (type === 'mcq') {
              const options: string[] = []
              for (const key of ['optionA', 'optionB', 'optionC', 'optionD']) {
                if (row[key]?.trim()) options.push(row[key].trim())
              }
              if (options.length < 2) {
                throw new Error(`Row ${rowNum}: MCQ needs at least 2 options`)
              }
              question.options = options
            }

            if (row.correctAnswer?.trim()) {
              question.correctAnswer = row.correctAnswer.trim()
            }
            if (row.markingScheme?.trim()) {
              question.markingScheme = row.markingScheme.trim()
            }

            questions.push(question)
          }

          if (questions.length === 0) {
            throw new Error('No valid questions found in CSV')
          }

          resolve(questions)
        } catch (err: any) {
          reject(err)
        }
      },
      error(err) {
        reject(new Error(`CSV parse error: ${err.message}`))
      },
    })
  })
}

export default function QuestionsPage() {
  const { routeParams } = usePageContext()
  const id = routeParams?.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<CreateQuestionData>(EMPTY_QUESTION)
  const [isNew, setIsNew] = useState(false)

  // CSV import state
  const [showImportModal, setShowImportModal] = useState(false)
  const [csvQuestions, setCsvQuestions] = useState<CreateQuestionData[]>([])
  const [csvError, setCsvError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        examService.getById(id),
        examService.getQuestions(id),
      ])
      setExam(examRes.data)
      setQuestions(questionsRes.data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exam data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  const selectQuestion = (index: number) => {
    const q = questions[index]
    setSelectedIndex(index)
    setIsNew(false)
    setEditForm({
      type: q.type,
      questionText: q.questionText,
      points: q.points,
      options: q.type === 'mcq' ? (q.options?.length ? [...q.options] : ['', '', '', '']) : [],
      correctAnswer: q.correctAnswer || '',
      markingScheme: q.markingScheme || '',
    })
  }

  const startNew = () => {
    setSelectedIndex(null)
    setIsNew(true)
    setEditForm({ ...EMPTY_QUESTION, options: ['', '', '', ''] })
  }

  const handleSave = async () => {
    if (!editForm.questionText.trim()) {
      toast.error('Question text is required')
      return
    }
    if (editForm.type === 'mcq') {
      const validOptions = editForm.options?.filter(o => o.trim()) || []
      if (validOptions.length < 2) {
        toast.error('At least 2 options are required for MCQ')
        return
      }
      if (!editForm.correctAnswer) {
        toast.error('Select the correct answer')
        return
      }
    }
    if (editForm.type === 'true_false' && !editForm.correctAnswer) {
      toast.error('Select the correct answer')
      return
    }

    // Validate points don't exceed max score
    if (exam) {
      const otherPoints = questions.reduce((sum, q, i) => {
        if (!isNew && selectedIndex === i) return sum // exclude current question being edited
        return sum + q.points
      }, 0)
      if (otherPoints + editForm.points > exam.maxScore) {
        toast.error(`Total points (${otherPoints + editForm.points}) would exceed max score (${exam.maxScore})`)
        return
      }
    }

    setSaving(true)
    try {
      const data: CreateQuestionData = {
        type: editForm.type,
        questionText: editForm.questionText,
        points: editForm.points,
      }

      if (editForm.type === 'mcq') {
        data.options = editForm.options?.filter(o => o.trim())
        data.correctAnswer = editForm.correctAnswer
      } else if (editForm.type === 'true_false') {
        data.correctAnswer = editForm.correctAnswer
      } else {
        data.markingScheme = editForm.markingScheme
      }

      if (isNew) {
        await examService.createQuestion(id, data)
        toast.success('Question added')
      } else if (selectedIndex !== null) {
        await examService.updateQuestion(id, questions[selectedIndex]._id, data)
        toast.success('Question updated')
      }

      await fetchData()
      setIsNew(false)
      setSelectedIndex(null)
      setEditForm(EMPTY_QUESTION)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm('Delete this question?')) return
    try {
      await examService.deleteQuestion(id, questionId)
      toast.success('Question deleted')
      setSelectedIndex(null)
      setIsNew(false)
      await fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete question')
    }
  }

  const handlePublish = async () => {
    if (!confirm('Publish this exam? Students will be able to take it.')) return
    setPublishing(true)
    try {
      await examService.publishExam(id)
      toast.success('Exam published successfully')
      await fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish exam')
    } finally {
      setPublishing(false)
    }
  }

  const addOption = () => {
    setEditForm(prev => ({
      ...prev,
      options: [...(prev.options || []), ''],
    }))
  }

  const removeOption = (index: number) => {
    setEditForm(prev => {
      const opts = [...(prev.options || [])]
      const removed = opts.splice(index, 1)[0]
      return {
        ...prev,
        options: opts,
        correctAnswer: prev.correctAnswer === removed ? '' : prev.correctAnswer,
      }
    })
  }

  const updateOption = (index: number, value: string) => {
    setEditForm(prev => {
      const opts = [...(prev.options || [])]
      const oldVal = opts[index]
      opts[index] = value
      return {
        ...prev,
        options: opts,
        correctAnswer: prev.correctAnswer === oldVal ? value : prev.correctAnswer,
      }
    })
  }

  // CSV import handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError('')
    setCsvQuestions([])

    try {
      const parsed = await parseCsvToQuestions(file)
      setCsvQuestions(parsed)
    } catch (err: any) {
      setCsvError(err.message)
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImport = async () => {
    if (csvQuestions.length === 0) return

    // Validate total points
    if (exam) {
      const importTotal = csvQuestions.reduce((sum, q) => sum + q.points, 0)
      if (totalPoints + importTotal > exam.maxScore) {
        toast.error(`Import would bring total to ${totalPoints + importTotal} points, exceeding max score of ${exam.maxScore}`)
        return
      }
    }

    setImporting(true)
    try {
      const result = await examService.bulkCreateQuestions(id, csvQuestions)
      const { successCount, failureCount } = result.data
      if (failureCount > 0) {
        toast.warning(`${successCount} imported, ${failureCount} failed`)
      } else {
        toast.success(`${successCount} questions imported successfully`)
      }
      setShowImportModal(false)
      setCsvQuestions([])
      await fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to import questions')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!exam) {
    return <div className="text-center py-12 text-gray-500">Exam not found</div>
  }

  const isEditing = isNew || selectedIndex !== null
  const isReadOnly = !!exam.published

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Exams', href: '/exams' },
        { label: exam.name, href: `/exams/${id}` },
        { label: 'Questions' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Builder</h1>
          <p className="text-sm text-gray-500 mt-1">
            {exam.name} &middot; {questions.length} questions &middot; {totalPoints} points total
            {exam.maxScore !== totalPoints && (
              <span className="text-amber-600 ml-2">(Max score: {exam.maxScore})</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {!exam.published ? (
            <Button
              onClick={handlePublish}
              loading={publishing}
              disabled={questions.length === 0}
            >
              Publish Exam
            </Button>
          ) : (
            <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              Published
            </span>
          )}
          <Button variant="outline" onClick={() => navigate(`/exams/${id}`)}>
            Back to Exam
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Question List */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Questions</h3>
              {!exam.published && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
                    Import CSV
                  </Button>
                  <Button size="sm" onClick={startNew}>+ Add</Button>
                </div>
              )}
            </div>
            {exam.published && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">Exam is published. Questions are locked.</p>
              </div>
            )}

            {questions.length === 0 && !isNew ? (
              <p className="text-sm text-gray-500 text-center py-8">No questions yet. Click "Add" to get started.</p>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <button
                    key={q._id}
                    onClick={() => selectQuestion(i)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedIndex === i && !isNew
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        q.type === 'mcq' ? 'bg-purple-100 text-purple-700' :
                        q.type === 'true_false' ? 'bg-blue-100 text-blue-700' :
                        q.type === 'short_answer' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {QUESTION_TYPES.find(t => t.value === q.type)?.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Q{i + 1}. {q.questionText}
                        </p>
                        <p className="text-xs text-gray-500">{q.points} pts</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Points</span>
                <span className={`font-bold ${totalPoints > (exam?.maxScore || 0) ? 'text-red-600' : totalPoints === (exam?.maxScore || 0) ? 'text-green-600' : 'text-blue-600'}`}>
                  {totalPoints} / {exam?.maxScore || 0}
                </span>
              </div>
              {totalPoints > (exam?.maxScore || 0) && (
                <p className="text-xs text-red-600">Exceeds max score!</p>
              )}
            </div>
          </Card>
        </div>

        {/* Question Editor */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isNew ? 'New Question' : `Edit Question ${(selectedIndex ?? 0) + 1}`}
              </h3>

              <div className="space-y-5">
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {QUESTION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setEditForm(prev => ({
                          ...prev,
                          type: type.value,
                          options: type.value === 'mcq' ? (prev.options?.length ? prev.options : ['', '', '', '']) : [],
                          correctAnswer: type.value === 'true_false' ? '' : prev.correctAnswer,
                        }))}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''} ${
                          editForm.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="block font-bold text-lg">{type.icon}</span>
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                  <textarea
                    value={editForm.questionText}
                    onChange={(e) => setEditForm(prev => ({ ...prev, questionText: e.target.value }))}
                    readOnly={isReadOnly}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px] ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter your question..."
                  />
                </div>

                {/* Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={editForm.points}
                      onChange={(e) => setEditForm(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                      readOnly={isReadOnly}
                      className={`w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      min={1}
                      max={exam ? exam.maxScore - questions.reduce((sum, q, i) => (!isNew && selectedIndex === i) ? sum : sum + q.points, 0) : undefined}
                    />
                    {exam && (
                      <span className={`text-sm ${
                        (() => {
                          const otherPoints = questions.reduce((sum, q, i) => (!isNew && selectedIndex === i) ? sum : sum + q.points, 0)
                          const remaining = exam.maxScore - otherPoints - editForm.points
                          return remaining < 0 ? 'text-red-600 font-medium' : remaining === 0 ? 'text-green-600' : 'text-gray-500'
                        })()
                      }`}>
                        {(() => {
                          const otherPoints = questions.reduce((sum, q, i) => (!isNew && selectedIndex === i) ? sum : sum + q.points, 0)
                          const remaining = exam.maxScore - otherPoints - editForm.points
                          if (remaining < 0) return `Exceeds max score by ${Math.abs(remaining)}`
                          if (remaining === 0) return `Max score reached (${exam.maxScore})`
                          return `${remaining} of ${exam.maxScore} remaining`
                        })()}
                      </span>
                    )}
                  </div>
                </div>

                {/* MCQ Options */}
                {editForm.type === 'mcq' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options (select the correct answer)</label>
                    <div className="space-y-2">
                      {editForm.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setEditForm(prev => ({ ...prev, correctAnswer: opt }))}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isReadOnly ? 'cursor-not-allowed' : ''} ${
                              editForm.correctAnswer === opt && opt.trim()
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {editForm.correctAnswer === opt && opt.trim() ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <span className="text-xs font-medium text-gray-400">{String.fromCharCode(65 + i)}</span>
                            )}
                          </button>
                          <input
                            value={opt}
                            onChange={(e) => updateOption(i, e.target.value)}
                            readOnly={isReadOnly}
                            className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          />
                          {!isReadOnly && (editForm.options?.length || 0) > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(i)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {!isReadOnly && (editForm.options?.length || 0) < 6 && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                )}

                {/* True/False */}
                {editForm.type === 'true_false' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                    <div className="flex gap-3">
                      {['True', 'False'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => setEditForm(prev => ({ ...prev, correctAnswer: val }))}
                          className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''} ${
                            editForm.correctAnswer === val
                              ? val === 'True' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marking Scheme (for essay/short answer) */}
                {(editForm.type === 'essay' || editForm.type === 'short_answer') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marking Scheme / Expected Answer</label>
                    <textarea
                      value={editForm.markingScheme}
                      onChange={(e) => setEditForm(prev => ({ ...prev, markingScheme: e.target.value }))}
                      readOnly={isReadOnly}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[80px] ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      placeholder="Guidelines for grading this question..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This is only visible to teachers during grading</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {!exam.published ? (
                    <>
                      <Button onClick={handleSave} loading={saving}>
                        {isNew ? 'Add Question' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setIsNew(false); setSelectedIndex(null) }}
                      >
                        Cancel
                      </Button>
                      {!isNew && selectedIndex !== null && (
                        <Button
                          variant="secondary"
                          onClick={() => handleDelete(questions[selectedIndex]._id)}
                          className="ml-auto text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => { setSelectedIndex(null) }}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">
                  {questions.length === 0 ? '📝' : '👈'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {questions.length === 0 ? 'No Questions Yet' : 'Select a Question'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {questions.length === 0
                    ? 'Start building your exam by adding questions, or import from a CSV file.'
                    : 'Click a question from the list to edit, or add a new one.'}
                </p>
                {!exam.published && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={startNew}>{questions.length === 0 ? 'Add First Question' : 'Add New Question'}</Button>
                    <Button variant="outline" onClick={() => setShowImportModal(true)}>Import CSV</Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Import Questions from CSV</h2>
              <button
                onClick={() => { setShowImportModal(false); setCsvQuestions([]); setCsvError('') }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1">
              {/* Template download */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">
                  Download the CSV template to see the expected format. Fill it in and upload below.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  Download CSV Template
                </button>
              </div>

              {/* CSV format info */}
              <div className="mb-4 text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-1">Required columns:</p>
                <p><code className="bg-gray-100 px-1 rounded">type</code> (mcq, true_false, short_answer, essay), <code className="bg-gray-100 px-1 rounded">questionText</code>, <code className="bg-gray-100 px-1 rounded">points</code></p>
                <p className="mt-1"><span className="font-medium text-gray-700">Optional:</span> optionA-D (MCQ), correctAnswer, markingScheme</p>
              </div>

              {/* File upload */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Error */}
              {csvError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{csvError}</p>
                </div>
              )}

              {/* Preview */}
              {csvQuestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview ({csvQuestions.length} questions, {csvQuestions.reduce((s, q) => s + q.points, 0)} total points)
                  </p>
                  {exam && totalPoints + csvQuestions.reduce((s, q) => s + q.points, 0) > exam.maxScore && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700">
                        Import would bring total to {totalPoints + csvQuestions.reduce((s, q) => s + q.points, 0)} points, exceeding max score of {exam.maxScore}
                      </p>
                    </div>
                  )}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-500">#</th>
                          <th className="px-3 py-2 text-left text-gray-500">Type</th>
                          <th className="px-3 py-2 text-left text-gray-500">Question</th>
                          <th className="px-3 py-2 text-left text-gray-500">Pts</th>
                          <th className="px-3 py-2 text-left text-gray-500">Answer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {csvQuestions.map((q, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                q.type === 'mcq' ? 'bg-purple-100 text-purple-700' :
                                q.type === 'true_false' ? 'bg-blue-100 text-blue-700' :
                                q.type === 'short_answer' ? 'bg-green-100 text-green-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {q.type === 'true_false' ? 'T/F' : q.type === 'short_answer' ? 'Short' : q.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-2 max-w-[200px] truncate">{q.questionText}</td>
                            <td className="px-3 py-2">{q.points}</td>
                            <td className="px-3 py-2 text-gray-500 truncate max-w-[100px]">
                              {q.correctAnswer || (q.markingScheme ? 'Has scheme' : '-')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setShowImportModal(false); setCsvQuestions([]); setCsvError('') }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                loading={importing}
                disabled={csvQuestions.length === 0}
              >
                Import {csvQuestions.length > 0 ? `${csvQuestions.length} Questions` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
