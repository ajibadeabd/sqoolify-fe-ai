import { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { parentService } from '../../../lib/api-services'
import DataTable, { type Column } from '../../../components/ui/DataTable'
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

  const columns: Column<any>[] = [
    { key: 'admissionNo', header: 'Admission No' },
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.user ? `${item.user.firstName} ${item.user.lastName}` : '-',
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (item) => {
        const g = item.gender?.toLowerCase()
        if (!g) return <span className="text-gray-400">-</span>
        const cls = g === 'male' ? 'bg-sky-100 text-sky-700' : g === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${cls}`}>
            {g}
          </span>
        )
      },
    },
    {
      key: 'class',
      header: 'Class',
      render: (item) => {
        const name = (item.class as any)?.name
        if (!name) return <span className="text-gray-400">-</span>
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {name}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const s = item.status || 'active'
        const map: Record<string, string> = {
          active: 'bg-green-100 text-green-700',
          inactive: 'bg-gray-100 text-gray-600',
          graduated: 'bg-blue-100 text-blue-700',
          transferred: 'bg-yellow-100 text-yellow-700',
          suspended: 'bg-red-100 text-red-700',
        }
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${map[s] || 'bg-gray-100 text-gray-600'}`}>
            {s}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'My Children' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <p className="text-sm text-gray-500 mt-1">{children.length} total</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={children}
        loading={loading}
        emptyMessage="No children linked to your account"
        onRowClick={(item) => navigate(`/my-children/${item._id}`)}
      />
    </div>
  )
}