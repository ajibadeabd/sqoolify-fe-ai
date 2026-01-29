import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { api } from '../../../../../lib/api'
import Card from '../../../../../components/ui/Card'
import Button from '../../../../../components/ui/Button'
import Breadcrumbs from '../../../../../components/layout/Breadcrumbs'

export default function ScoreEntryPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [exam, setExam] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [scores, setScores] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken') || ''
        const examRes = await api.get<any>(`/exams/${id}`, { token })
        setExam(examRes)

        // Fetch students for the exam's class
        if (examRes.class?._id) {
          const studentsRes = await api.get<any>(`/students?class=${examRes.class._id}&limit=100`, { token })
          setStudents(studentsRes.result || [])
        }

        // Fetch existing scores
        const scoresRes = await api.get<any>(`/exams/${id}/scores`, { token })
        const existingScores: Record<string, string> = {}
        if (scoresRes.result) {
          scoresRes.result.forEach((s: any) => {
            existingScores[s.student?._id || s.student] = String(s.score)
          })
        }
        setScores(existingScores)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

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

      await api.post(`/exams/${id}/scores`, { scores: scoreEntries }, { token })
      setMessage('Scores saved successfully!')
    } catch (err: any) {
      setMessage(err.message || 'Failed to save scores')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Exams', href: '/exams' },
        { label: exam?.name || 'Exam' },
        { label: 'Scores' },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enter Scores</h1>
          <p className="text-gray-500 mt-1">
            {exam?.name} - {exam?.subject?.name || ''} ({exam?.class?.name || ''})
            {exam?.maxScore ? ` | Max: ${exam.maxScore}` : ''}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/exams')}>Back</Button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <Card>
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No students found for this class</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">#</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Admission No</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Score {exam?.maxScore ? `(Max: ${exam.maxScore})` : ''}
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
                        max={exam?.maxScore || 100}
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
        )}

        {students.length > 0 && (
          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={handleSave} loading={saving}>Save Scores</Button>
          </div>
        )}
      </Card>
    </div>
  )
}
