import { create } from 'zustand'
import { feeService } from '../api-services'
import type { Fee } from '../types'

interface FeeFilters {
  page: number
  classId: string
  sessionId: string
  limit: number
}

interface FeeSummary {
  totalFees?: number
  totalCollected: number
  totalOutstanding: number
}

interface FeeState {
  fees: Fee[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: FeeFilters
  summary: FeeSummary | null

  fetchFees: (filters?: Partial<FeeFilters>) => Promise<void>
  setFilter: (key: keyof FeeFilters, value: any) => void
  resetFilters: () => void
  deleteFee: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: FeeFilters = {
  page: 1,
  classId: '',
  sessionId: '',
  limit: 10,
}

export const useFeeStore = create<FeeState>((set, get) => ({
  fees: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },
  summary: null,

  fetchFees: async (overrides?: Partial<FeeFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[FeeStore] Serving from cache — skipping API call')
      return
    }
    console.log('[FeeStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const [feesRes, summaryRes] = await Promise.all([
        feeService.getAll({
          page: filters.page,
          limit: filters.limit,
          classId: filters.classId || undefined,
          sessionId: filters.sessionId || undefined,
        }),
        feeService.getSummary(),
      ])
      set({
        fees: feesRes.data || [],
        totalPages: feesRes.pagination?.totalPages || 1,
        total: feesRes.pagination?.total || 0,
        summary: summaryRes.data || null,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch fees', fees: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchFees(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchFees(DEFAULT_FILTERS)
  },

  deleteFee: async (id: string) => {
    await feeService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchFees()
  },
}))
