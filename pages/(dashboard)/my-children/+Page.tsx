import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { parentService } from '../../../lib/api-services'
import Card from '../../../components/ui/Card'
import Avatar from '../../../components/ui/Avatar'
import Badge from '../../../components/ui/Badge'
import Breadcrumbs from '../../../components/layout/Breadcrumbs'

export default function MyChildrenPage() {
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await parentService.getMyChildren()
        setChildren(res.data || [])
      } catch {
        setChildren([])
      } finally {
        setLoading(false)
      }
    }
    fetchChildren()
  }, [])

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Children' }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Children</h1>

      {children.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">No children linked to your account</div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child: any) => {
            const user = child.user || {}
            return (
              <Card key={child._id}>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar name={`${user.firstName || ''} ${user.lastName || ''}`} size="md" />
                  <div>
                    <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500">Admission: {child.admissionNo}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Class</span>
                    <span className="font-medium">{child.class?.name || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium capitalize">{child.gender || '-'}</span>
                  </div>
                </div>

                <button
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border-t border-gray-100"
                  onClick={() => navigate(`/my-children/${child._id}/report-card`)}
                >
                  View Report Card
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
