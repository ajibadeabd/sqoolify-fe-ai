import { create } from 'zustand'
import { classService } from '../api-services'
import type { SchoolClass } from '../types'

interface ClassFilters {
  page: number
  search: string
  sessionId: string
  limit: number
}

interface ClassState {
  classes: SchoolClass[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: ClassFilters

  fetchClasses: (filters?: Partial<ClassFilters>) => Promise<void>
  setFilter: (key: keyof ClassFilters, value: any) => void
  resetFilters: () => void
  deleteClass: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: ClassFilters = {
  page: 1,
  search: '',
  sessionId: '',
  limit: 10,
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchClasses: async (overrides?: Partial<ClassFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[ClassStore] Serving from cache — skipping API call')
      return
    }
    console.log('[ClassStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await classService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        sessionId: filters.sessionId || undefined,
      })
      set({
        classes: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch classes', classes: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchClasses(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchClasses(DEFAULT_FILTERS)
  },

  deleteClass: async (id: string) => {
    await classService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchClasses()
  },
}))
