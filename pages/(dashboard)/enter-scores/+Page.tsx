import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Select from '../../../components/ui/Select'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'

export default function EnterScoresPage() {
  const [exams, setExams] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [scores, setScores] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem('accessToken') || ''
        const res = await api.get<any>('/teachers/my-exams?limit=100', { token })
        setExams(res.result || [])
      } catch {
        setExams([])
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  useEffect(() => {
    if (!selectedExam) {
      setStudents([])
      setScores({})
      return
    }
    const fetchStudents = async () => {
      setLoadingStudents(true)
      try {
        const token = localStorage.getItem('accessToken') || ''
        const exam = exams.find((e) => e._id === selectedExam)
        if (exam?.class?._id) {
          const studentsRes = await api.get<any>(`/students?class=${exam.class._id}&limit=100`, { token })
          setStudents(studentsRes.result || [])
        }

        const scoresRes = await api.get<any>(`/exams/${selectedExam}/scores`, { token })
        const existingScores: Record<string, string> = {}
        if (scoresRes.result) {
          scoresRes.result.forEach((s: any) => {
            existingScores[s.student?._id || s.student] = String(s.score)
          })
        }
        setScores(existingScores)
      } catch {
        setStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [selectedExam])

  const handleScoreChange = (studentId: string, value: string) => {
    setScores({ ...scores, [studentId]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const token = localStorage.getItem('accessToken') || ''
      const scoreEntries = Object.entries(scores)
        .filter(([, value]) => value !== '')
        .map(([studentId, score]) => ({
          student: studentId,
          score: Number(score),
        }))

      await api.post(`/exams/${selectedExam}/scores`, { scores: scoreEntries }, { token })
      setMessage('Scores saved successfully!')
    } catch (err: any) {
      setMessage(err.message || 'Failed to save scores')
    } finally {
      setSaving(false)
    }
  }

  const selectedExamData = exams.find((e) => e._id === selectedExam)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Enter Scores' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enter Scores</h1>

      <Card>
        <div className="max-w-md mb-6">
          <Select
            label="Select Exam"
            value={selectedExam}
            onChange={(e) => setSelectedExam((e.target as HTMLSelectElement).value)}
            placeholder="Choose an exam..."
            options={exams.map((exam) => ({
              value: exam._id,
              label: `${exam.name} - ${exam.subject?.name || ''} (${exam.class?.name || ''})`,
            }))}
          />
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        {loading && <p className="text-gray-500">Loading exams...</p>}

        {loadingStudents && <p className="text-gray-500">Loading students...</p>}

        {selectedExam && !loadingStudents && students.length === 0 && (
          <p className="text-gray-500 text-center py-8">No students found for this exam's class</p>
        )}

        {selectedExam && students.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">#</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Student</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Admission No</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Score {selectedExamData?.maxScore ? `(Max: ${selectedExamData.maxScore})` : ''}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, index) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {student.user?.firstName} {student.user?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{student.admissionNo}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max={selectedExamData?.maxScore || 100}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={scores[student._id] || ''}
                          onChange={(e) => handleScoreChange(student._id, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button onClick={handleSave} loading={saving}>Save Scores</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
