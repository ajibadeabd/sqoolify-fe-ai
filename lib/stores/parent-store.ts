import { create } from 'zustand'
import { parentService } from '../api-services'
import type { Parent } from '../types'

interface ParentFilters {
  page: number
  search: string
  limit: number
}

interface ParentState {
  parents: Parent[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: ParentFilters

  fetchParents: (filters?: Partial<ParentFilters>) => Promise<void>
  setFilter: (key: keyof ParentFilters, value: any) => void
  resetFilters: () => void
  deleteParent: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: ParentFilters = {
  page: 1,
  search: '',
  limit: 10,
}

export const useParentStore = create<ParentState>((set, get) => ({
  parents: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchParents: async (overrides?: Partial<ParentFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[ParentStore] Serving from cache — skipping API call')
      return
    }
    console.log('[ParentStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await parentService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
      })
      set({
        parents: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch parents', parents: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchParents(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchParents(DEFAULT_FILTERS)
  },

  deleteParent: async (id: string) => {
    await parentService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchParents()
  },
}))
