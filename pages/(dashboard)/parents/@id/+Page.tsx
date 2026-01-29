import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { api } from '../../../../lib/api'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Avatar from '../../../../components/ui/Avatar'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'

export default function ParentDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const [parent, setParent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const res = await api.get<any>(`/parents/${id}`)
        setParent(res.data)
      } catch {
        setParent(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchParent()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/parents/${id}`)
      await navigate('/parents')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  }

  if (!parent) {
    return <div className="text-center py-12 text-gray-500">Parent not found</div>
  }

  const user = parent.user || {}

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Parents', href: '/parents' }, { label: `${user.firstName || ''} ${user.lastName || ''}` }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Parent Details</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/parents')}>Back</Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex items-center gap-6">
          <Avatar name={`${user.firstName || ''} ${user.lastName || ''}`} size="lg" />
          <div>
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500 capitalize">{parent.relationship || 'Parent/Guardian'}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant={parent.isActive !== false ? 'success' : 'danger'}>
                {parent.isActive !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card title="Contact Information">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium">{user.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <p className="font-medium">{user.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Relationship</label>
            <p className="font-medium capitalize">{parent.relationship || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Occupation</label>
            <p className="font-medium">{parent.occupation || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-500">Address</label>
            <p className="font-medium">{parent.address || '-'}</p>
          </div>
        </div>
      </Card>

      {/* Children */}
      <Card title={`Children (${parent.children?.length || 0})`}>
        {parent.children && parent.children.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parent.children.map((child: any) => {
              const childUser = child.user || {}
              return (
                <div
                  key={child._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/students/${child._id}`)}
                >
                  <p className="font-medium">{childUser.firstName} {childUser.lastName}</p>
                  <p className="text-sm text-gray-500">Admission: {child.admissionNo || '-'}</p>
                  <p className="text-sm text-gray-500">Class: {child.class?.name || 'Not assigned'}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500">No children linked to this parent</p>
        )}
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Parent"
        message={`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
