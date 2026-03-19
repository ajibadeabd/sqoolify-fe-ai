import { create } from 'zustand'
import { subjectService } from '../api-services'
import type { Subject } from '../types'

interface SubjectFilters {
  page: number
  search: string
  limit: number
}

interface SubjectState {
  subjects: Subject[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: SubjectFilters

  fetchSubjects: (filters?: Partial<SubjectFilters>) => Promise<void>
  setFilter: (key: keyof SubjectFilters, value: any) => void
  resetFilters: () => void
  deleteSubject: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: SubjectFilters = {
  page: 1,
  search: '',
  limit: 10,
}

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchSubjects: async (overrides?: Partial<SubjectFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[SubjectStore] Serving from cache — skipping API call')
      return
    }
    console.log('[SubjectStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await subjectService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
      })
      set({
        subjects: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch subjects', subjects: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchSubjects(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchSubjects(DEFAULT_FILTERS)
  },

  deleteSubject: async (id: string) => {
    await subjectService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchSubjects()
  },
}))
