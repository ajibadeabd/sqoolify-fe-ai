import { create } from 'zustand'
import { teacherService } from '../api-services'
import type { Teacher } from '../types'

interface TeacherFilters {
  page: number
  search: string
  limit: number
}

interface TeacherState {
  teachers: Teacher[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: TeacherFilters

  fetchTeachers: (filters?: Partial<TeacherFilters>) => Promise<void>
  setFilter: (key: keyof TeacherFilters, value: any) => void
  resetFilters: () => void
  deleteTeacher: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: TeacherFilters = {
  page: 1,
  search: '',
  limit: 10,
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  teachers: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchTeachers: async (overrides?: Partial<TeacherFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[TeacherStore] Serving from cache — skipping API call')
      return
    }
    console.log('[TeacherStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await teacherService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
      })
      set({
        teachers: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch teachers', teachers: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchTeachers(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchTeachers(DEFAULT_FILTERS)
  },

  deleteTeacher: async (id: string) => {
    await teacherService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchTeachers()
  },
}))
