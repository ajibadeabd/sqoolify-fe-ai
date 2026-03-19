import { create } from 'zustand'
import { reportCardService } from '../api-services'
import type { ReportCard } from '../types'

interface ReportCardFilters {
  page: number
  search: string
  sessionId: string
  term: string
  limit: number
}

interface ReportCardState {
  reportCards: ReportCard[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: ReportCardFilters

  fetchReportCards: (filters?: Partial<ReportCardFilters>) => Promise<void>
  setFilter: (key: keyof ReportCardFilters, value: any) => void
  resetFilters: () => void
  invalidate: () => void
}

const DEFAULT_FILTERS: ReportCardFilters = {
  page: 1,
  search: '',
  sessionId: '',
  term: '',
  limit: 10,
}

export const useReportCardStore = create<ReportCardState>((set, get) => ({
  reportCards: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchReportCards: async (overrides?: Partial<ReportCardFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[ReportCardStore] Serving from cache — skipping API call')
      return
    }
    console.log('[ReportCardStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await reportCardService.getAll({
        page: filters.page,
        limit: filters.limit,
        sessionId: filters.sessionId || undefined,
        term: filters.term || undefined,
      })
      set({
        reportCards: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch report cards', reportCards: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchReportCards(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchReportCards(DEFAULT_FILTERS)
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchReportCards()
  },
}))
