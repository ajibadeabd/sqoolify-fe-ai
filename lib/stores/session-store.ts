import { create } from 'zustand'
import { sessionService } from '../api-services'
import type { Session } from '../types'

interface SessionFilters {
  page: number
  search: string
  limit: number
}

interface SessionState {
  sessions: Session[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: SessionFilters

  fetchSessions: (filters?: Partial<SessionFilters>) => Promise<void>
  setFilter: (key: keyof SessionFilters, value: any) => void
  resetFilters: () => void
  deleteSession: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: SessionFilters = {
  page: 1,
  search: '',
  limit: 10,
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchSessions: async (overrides?: Partial<SessionFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[SessionStore] Serving from cache — skipping API call')
      return
    }
    console.log('[SessionStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await sessionService.getAll({
        page: filters.page,
        limit: filters.limit,
      })
      set({
        sessions: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch sessions', sessions: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchSessions(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchSessions(DEFAULT_FILTERS)
  },

  deleteSession: async (id: string) => {
    await sessionService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchSessions()
  },
}))
