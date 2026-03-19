import { create } from 'zustand'
import { studentService } from '../api-services'
import type { Student } from '../types'

interface StudentFilters {
  page: number
  search: string
  classId: string
  limit: number
}

interface StudentState {
  students: Student[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: StudentFilters

  fetchStudents: (filters?: Partial<StudentFilters>) => Promise<void>
  setFilter: (key: keyof StudentFilters, value: any) => void
  resetFilters: () => void
  deleteStudent: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: StudentFilters = {
  page: 1,
  search: '',
  classId: '',
  limit: 10,
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchStudents: async (overrides?: Partial<StudentFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[StudentStore] Serving from cache — skipping API call')
      return
    }
    console.log('[StudentStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await studentService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        classId: filters.classId || undefined,
      })
      set({
        students: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch students', students: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchStudents(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchStudents(DEFAULT_FILTERS)
  },

  deleteStudent: async (id: string) => {
    await studentService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchStudents()
  },
}))
