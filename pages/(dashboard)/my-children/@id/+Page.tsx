import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { parentService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'

export default function ChildDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await parentService.getMyChildById(id)
        setStudent(res.data)
      } catch {
        setStudent(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchChild()
  }, [id])

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  }

  if (!student) {
    return <div className="text-center py-12 text-gray-500">Child not found</div>
  }

  const user = student.user || {}

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
    inactive: 'warning',
    graduated: 'info',
    transferred: 'warning',
    suspended: 'danger',
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'My Children', href: '/my-children' },
        { label: `${user.firstName || ''} ${user.lastName || ''}` },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
            <Badge variant={statusColors[student.status] || 'info'}>{student.status || 'active'}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Admission No: {student.admissionNo}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/my-children')}>Back</Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/my-children/${id}/report-card`)}
                className="flex items-center gap-3 w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">R</div>
                <div>
                  <p className="font-medium text-gray-900">Report Card</p>
                  <p className="text-sm text-gray-500">View academic report</p>
                </div>
              </button>
              <button
                onClick={() => navigate(`/my-children/${id}/fees`)}
                className="flex items-center gap-3 w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-lg shrink-0">F</div>
                <div>
                  <p className="font-medium text-gray-900">Fees</p>
                  <p className="text-sm text-gray-500">View fee details</p>
                </div>
              </button>
              <button
                onClick={() => navigate(`/my-children/${id}/attendance`)}
                className="flex items-center gap-3 w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold text-lg shrink-0">A</div>
                <div>
                  <p className="font-medium text-gray-900">Attendance</p>
                  <p className="text-sm text-gray-500">View attendance record</p>
                </div>
              </button>
            </div>
          </Card>
 

        </div>

        {/* Right Column - Quick Info */}
        <div className="lg:col-span-3">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Student</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-lg">{user.firstName} {user.lastName}</p>
                  <Badge variant={statusColors[student.status] || 'info'}>{student.status || 'active'}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg ${student.gender === 'female' ? 'bg-pink-50' : 'bg-sky-50'}`}>
                  <p className={`text-xs mb-1 ${student.gender === 'female' ? 'text-pink-600' : 'text-sky-600'}`}>Gender</p>
                  <p className={`font-medium text-sm capitalize ${student.gender === 'female' ? 'text-pink-700' : 'text-sky-700'}`}>
                    {student.gender || '-'}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Blood Group</p>
                  <p className="font-medium text-red-700 text-sm">{student.bloodGroup || '-'}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Class</p>
                <p className="font-medium text-blue-700 text-sm">
                  {student.class?.name || 'Not assigned'}
                  {student.class?.section && ` - ${student.class.section}`}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 mb-1">Date of Birth</p>
                <p className="font-medium text-purple-700 text-sm">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}</p>
              </div>
               <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 mb-1">Email</p>
                <p className="font-medium text-indigo-700 text-sm">{user.email || '-'}</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 mb-1">Phone</p>
                <p className="font-medium text-green-700 text-sm">{user.phone || '-'}</p>
              </div>

              {student.admissionDate && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Admission Date</p>
                  <p className="font-medium text-orange-700 text-sm">
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {student.address && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-700">{student.address}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}