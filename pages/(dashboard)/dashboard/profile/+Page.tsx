import Card from '../../../../components/ui/Card'
import Avatar from '../../../../components/ui/Avatar'
import Badge from '../../../../components/ui/Badge'
import { useAuth } from '../../../../lib/auth-context'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const userRole = user.role || ''

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="ring-4 ring-white/30 rounded-full">
            <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-indigo-100 capitalize">{userRole.replace('_', ' ') || 'Member'}</p>
          </div>
          <div className="ml-auto">
            <Badge variant={user.isActive ? 'success' : 'danger'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-600 mb-1">Email</p>
          <p className="font-medium text-blue-700 text-sm truncate">{user.email}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <p className="text-xs text-green-600 mb-1">Phone</p>
          <p className="font-medium text-green-700 text-sm">{user.phone || 'Not set'}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-xs text-purple-600 mb-1">Role</p>
          <p className="font-medium text-purple-700 text-sm capitalize">{userRole.replace('_', ' ') || 'Member'}</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-xs text-orange-600 mb-1">Verification</p>
          <p className="font-medium text-orange-700 text-sm">{user.isVerify ? 'Verified' : 'Not verified'}</p>
        </div>
      </div>

      {/* Account Details */}
      <Card title="Account Details">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">First Name</label>
            <p className="font-medium text-gray-900">{user.firstName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Last Name</label>
            <p className="font-medium text-gray-900">{user.lastName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email Address</label>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone Number</label>
            <p className="font-medium text-gray-900">{user.phone || 'Not set'}</p>
          </div>
        </div>
      </Card>

      {/* School */}
      {user.school && (
        <Card title="School">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                {user.school || 'School'}
              </p>
              {userRole && (
                <span className="mt-1 inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">
                  {userRole.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
