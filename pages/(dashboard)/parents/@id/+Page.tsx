import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { parentService } from '../../../../lib/api-services'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import Badge from '../../../../components/ui/Badge'
import Avatar from '../../../../components/ui/Avatar'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'
import ConfirmDialog from '../../../../components/ui/ConfirmDialog'
import { usePermission } from '../../../../lib/use-permission'

export default function ParentDetailPage() {
  const pageContext = usePageContext()
  const id = (pageContext.routeParams as any)?.id
  const { can } = usePermission()
  const [parent, setParent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const res = await parentService.getById(id)
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
      await parentService.delete(id)
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card>
            <div className="flex items-center gap-6">
              <Avatar name={`${user.firstName || ''} ${user.lastName || ''}`} size="lg" />
              <div>
                <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-500 capitalize">{parent.relationship || 'Parent/Guardian'}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={parent.isActive !== false ? 'success' : 'danger'}>
                    {parent.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/parents')}>Back</Button>
            {can('write_users') && <Button variant="primary" onClick={() => navigate(`/parents/${id}/edit`)}>Edit</Button>}
            {can('delete_users') && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete</Button>}
          </div>

          {/* Children */}
          <Card title={`Children (${parent.children?.length || 0})`}>
            {parent.children && parent.children.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
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
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card title="Quick Info">
              <div className="space-y-3">
                {/* Name */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-700 text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{parent.relationship || 'Parent/Guardian'}</p>
                </div>

                {/* Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <Badge variant={parent.isActive !== false ? 'success' : 'danger'}>
                    {parent.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Email */}
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">Email</p>
                  <p className="font-medium text-purple-700 text-sm">{user.email || 'Not set'}</p>
                </div>

                {/* Phone */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Phone</p>
                  <p className="font-medium text-green-700 text-sm">{user.phone || 'Not set'}</p>
                </div>

                {/* Occupation */}
                {parent.occupation && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-600 mb-1">Occupation</p>
                    <p className="font-medium text-orange-700 text-sm">{parent.occupation}</p>
                  </div>
                )}

                {/* Relationship */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Relationship</p>
                  <p className="font-medium text-blue-700 text-sm capitalize">{parent.relationship || 'Not set'}</p>
                </div>

                {/* Address */}
                {parent.address && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-700 text-sm">{parent.address}</p>
                  </div>
                )}

                {/* Children Count */}
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-600 mb-1">Children</p>
                  <p className="font-medium text-indigo-700 text-sm">{parent.children?.length || 0} children</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

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
