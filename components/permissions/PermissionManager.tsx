import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { PERMISSIONS } from '../../lib/permissions'

interface PermissionManagerProps {
  userId: string
  currentPermissions: string[]
  onUpdate?: () => void
  embedded?: boolean
}

export default function PermissionManager({
  userId,
  currentPermissions,
  onUpdate,
  embedded = false,
}: PermissionManagerProps) {
  const [permissions, setPermissions] = useState<string[]>(currentPermissions)
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [permissionCategories, setPermissionCategories] = useState<Record<string, string[]>>({})
  const [loadingRoles, setLoadingRoles] = useState(true)

  useEffect(() => {
    setPermissions(currentPermissions)
  }, [currentPermissions])

  useEffect(() => {
    // Fetch available roles and permission categories from backend
    const fetchRolesAndCategories = async () => {
      try {
        const res = await api.get<{ data: { roles: string[]; categories: Record<string, string[]> } }>('/users/roles')
        setAvailableRoles(res.data.roles || [])
        setPermissionCategories(res.data.categories || {})
      } catch (err) {
        console.error('Failed to fetch roles and categories:', err)
        // Fallback to default roles if API fails
        setAvailableRoles(['admin', 'teacher', 'parent', 'student'])
        setPermissionCategories({})
      } finally {
        setLoadingRoles(false)
      }
    }
    fetchRolesAndCategories()
  }, [])

  const handleTogglePermission = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const handleApplyRole = async (role: string) => {
    setSaving(true)
    try {
      const res = await api.patch<{ data: { permissions: string[] } }>(`/users/${userId}/permissions`, { role })
      setPermissions(res.data.permissions || [])
      setSelectedRole(role)
      toast.success(`Applied ${role} role permissions`)
      onUpdate?.()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply role')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCustomPermissions = async () => {
    setSaving(true)
    try {
      await api.patch(`/users/${userId}/permissions`, { permissions })
      toast.success('Permissions updated successfully')
      setSelectedRole('custom')
      onUpdate?.()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  const allPermissions = Object.values(PERMISSIONS)

  // Use permission categories from backend
  const groupedPermissions = permissionCategories

  const content = (
      <div className="space-y-6">
        {/* Quick Role Assignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Role Assignment
          </label>
          {loadingRoles ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Loading roles...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'primary' : 'outline'}
                  onClick={() => handleApplyRole(role)}
                  disabled={saving}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Apply default permissions for a specific role
          </p>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Custom Permissions ({permissions.length} selected)
            </label>
            <Button
              onClick={handleSaveCustomPermissions}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Custom Permissions'}
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 capitalize">
                  {category.replace(/_/g, ' ')}
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {perms.map((permission) => {
                    const isSelected = permissions.includes(permission)
                    return (
                      <label
                        key={permission}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTogglePermission(permission)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Permissions Summary */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currently Active Permissions
          </label>
          <div className="flex flex-wrap gap-1">
            {permissions.length > 0 ? (
              permissions.map((perm) => (
                <Badge key={perm} variant="info" size="sm">
                  {perm.replace(/_/g, ' ')}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No permissions assigned</p>
            )}
          </div>
        </div>
      </div>
  )

  if (embedded) return content

  return (
    <Card title="Permissions & Role Management">
      {content}
    </Card>
  )
}
