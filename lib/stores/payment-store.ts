import { create } from 'zustand'
import { paymentService } from '../api-services'
import type { Payment } from '../types'

interface PaymentFilters {
  page: number
  search: string
  status: string
  category: string
  startDate: string
  endDate: string
  limit: number
}

interface PaymentSummary {
  totalPayments: number
  byCategory: Record<string, number>
  byStatus: Record<string, number>
}

interface PaymentState {
  payments: Payment[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: PaymentFilters
  summary: PaymentSummary | null

  fetchPayments: (filters?: Partial<PaymentFilters>) => Promise<void>
  setFilter: (key: keyof PaymentFilters, value: any) => void
  resetFilters: () => void
  invalidate: () => void
}

const DEFAULT_FILTERS: PaymentFilters = {
  page: 1,
  search: '',
  status: '',
  category: '',
  startDate: '',
  endDate: '',
  limit: 10,
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },
  summary: null,

  fetchPayments: async (overrides?: Partial<PaymentFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[PaymentStore] Serving from cache — skipping API call')
      return
    }
    console.log('[PaymentStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        paymentService.getAll({
          page: filters.page,
          limit: filters.limit,
          paymentStatus: filters.status || undefined,
          paymentCategory: filters.category || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        paymentService.getSummary(),
      ])
      set({
        payments: paymentsRes.data || [],
        totalPages: paymentsRes.pagination?.totalPages || 1,
        total: paymentsRes.pagination?.total || 0,
        summary: summaryRes.data || null,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch payments', payments: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchPayments(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchPayments(DEFAULT_FILTERS)
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchPayments()
  },
}))
