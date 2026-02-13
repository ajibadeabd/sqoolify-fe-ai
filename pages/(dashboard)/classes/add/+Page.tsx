import { useState } from 'react'
import { navigate } from 'vike/client/router'
import { toast } from 'sonner'
import { classService } from '../../../../lib/api-services'
import { useAppConfig } from '../../../../lib/use-app-config'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'
import Card from '../../../../components/ui/Card'
import Breadcrumbs from '../../../../components/layout/Breadcrumbs'

export default function AddClassPage() {
  const { classLevels, sectionPresets } = useAppConfig()

  const [form, setForm] = useState({
    name: '',
    section: '',
    capacity: '',
    level: '',
    room: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await classService.create({
        name: form.name,
        section: form.section || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        level: form.level || undefined,
        room: form.room || undefined,
        description: form.description || undefined,
      })

      toast.success('Class created successfully')
      await navigate('/classes')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  const capacityNum = form.capacity ? Number(form.capacity) : 0
  const capacityColor = capacityNum > 50 ? 'text-red-600' : capacityNum > 30 ? 'text-yellow-600' : 'text-green-600'

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Classes', href: '/classes' }, { label: 'Add Class' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Class</h1>
          <p className="text-sm text-gray-500 mt-1">Set up a new class for your school</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Class Information</h3>

                <div className="space-y-4">
                  <Input
                    label="Class Name *"
                    value={form.name}
                    onChange={(e) => update('name', (e.target as HTMLInputElement).value)}
                    placeholder="e.g. JSS 1, SS 2, Primary 3"
                    required
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    {classLevels.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                        <select
                          value={form.level}
                          onChange={(e) => update('level', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        >
                          <option value="">Select level (optional)</option>
                          {classLevels.map((level) => (
                            <option key={level.shortCode} value={level.shortCode}>
                              {level.name} ({level.shortCode})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <input
                        type="text"
                        value={form.section}
                        readOnly
                        placeholder="Select from presets below"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-default outline-none"
                      />
                      {sectionPresets.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {sectionPresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => update('section', preset)}
                              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                                form.section === preset
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Capacity & Room</h3>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Student Capacity"
                        type="number"
                        value={form.capacity}
                        onChange={(e) => update('capacity', (e.target as HTMLInputElement).value)}
                        placeholder="e.g. 40"
                      />
                      {capacityNum > 0 && (
                        <p className={`text-xs mt-1 ${capacityColor}`}>
                          {capacityNum > 50 ? 'Large class size' : capacityNum > 30 ? 'Standard class size' : 'Small class size'}
                        </p>
                      )}
                    </div>
                    <Input
                      label="Classroom / Room No."
                      value={form.room}
                      onChange={(e) => update('room', (e.target as HTMLInputElement).value)}
                      placeholder="e.g. Room 101, Block A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder="Any additional notes about this class..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" loading={loading} className="flex-1 sm:flex-none">
                  Create Class
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/classes')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Preview</h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Class Name</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-lg">{form.name || 'Not set'}</p>
                  {form.section && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{form.section}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">Capacity</p>
                  <p className="font-medium text-purple-700 text-sm">
                    {capacityNum > 0 ? `${capacityNum} students` : 'Not set'}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Level</p>
                  <p className="font-medium text-green-700 text-sm">
                    {form.level ? classLevels.find((l) => l.shortCode === form.level)?.name : 'Not set'}
                  </p>
                </div>
              </div>

              {form.room && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Classroom</p>
                  <p className="font-medium text-orange-700 text-sm">{form.room}</p>
                </div>
              )}

              {form.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{form.description}</p>
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">After creating this class, you can:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Assign a class teacher via Edit
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Add students from the class detail page
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Assign subjects from the Subjects page
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Tips</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>* Use a consistent naming convention (e.g. JSS 1, JSS 2)</li>
                <li>* Sections help differentiate arms (A, B, Science, Art)</li>
                <li>* Recommended capacity is 30-40 students per class</li>
                <li>* Class levels and section presets can be customized in Settings</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}