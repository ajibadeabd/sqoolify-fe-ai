import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { api } from '../../../../lib/api'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Avatar from '../../../../components/ui/Avatar'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'

export default function ReportCardDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [reportCard, setReportCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchReportCard = async () => {
      try {
        const token = localStorage.getItem('accessToken') || ''
        const res = await api.get<any>(`/report-cards/${id}`, { token })
        setReportCard(res)
      } catch {
        setReportCard(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchReportCard()
  }, [id])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const token = localStorage.getItem('accessToken') || ''
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'
      const response = await fetch(`${API_URL}/report-cards/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-card-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      // silently fail
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  }

  if (!reportCard) {
    return <div className="text-center py-12 text-gray-500">Report card not found</div>
  }

  const student = reportCard.student || {}
  const user = student.user || {}

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Report Cards', href: '/report-cards' },
        { label: `${user.firstName || ''} ${user.lastName || ''}` },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report Card</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/report-cards')}>Back</Button>
          <Button onClick={handleDownloadPdf} loading={downloading}>Download PDF</Button>
        </div>
      </div>

      {/* Student Info */}
      <Card>
        <div className="flex items-center gap-6 mb-6">
          <Avatar name={`${user.firstName || ''} ${user.lastName || ''}`} size="lg" />
          <div>
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500">Admission No: {student.admissionNo}</p>
            <div className="flex gap-2 mt-1">
              {reportCard.class?.name && <Badge variant="info">{reportCard.class.name}</Badge>}
              {reportCard.term?.name && <Badge variant="default">{reportCard.term.name}</Badge>}
              {reportCard.session?.name && <Badge variant="default">{reportCard.session.name}</Badge>}
            </div>
          </div>
        </div>

        {/* Subject Scores Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">#</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Score</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Grade</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(reportCard.scores || []).map((score: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{score.subject?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{score.score ?? '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant={score.grade === 'A' ? 'success' : score.grade === 'F' ? 'danger' : 'default'}>
                      {score.grade || '-'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{score.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-200">
          <div>
            <label className="text-sm text-gray-500">Total Score</label>
            <p className="text-2xl font-bold text-gray-900">{reportCard.totalScore ?? '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Average</label>
            <p className="text-2xl font-bold text-gray-900">{reportCard.average != null ? reportCard.average.toFixed(1) : '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Position</label>
            <p className="text-2xl font-bold text-gray-900">{reportCard.position || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Overall Grade</label>
            <p className="text-2xl font-bold text-gray-900">{reportCard.overallGrade || '-'}</p>
          </div>
        </div>

        {/* Remarks */}
        {reportCard.remarks && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <label className="text-sm text-gray-500">Remarks</label>
            <p className="font-medium mt-1">{reportCard.remarks}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
