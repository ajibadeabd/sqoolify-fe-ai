import { create } from 'zustand'
import { auditLogService } from '../api-services'

interface AuditLog {
  _id: string
  action: string
  performedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  targetUser?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  changes?: {
    before?: any
    after?: any
  }
  ipAddress?: string
  userAgent?: string
  createdAt: string
  metadata?: Record<string, any>
}

interface AuditLogPagination {
  total: number
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface AuditLogFilters {
  page: number
  limit: number
  action: string
  startDate: string
  endDate: string
}

interface AuditLogState {
  logs: AuditLog[]
  loading: boolean
  loaded: boolean
  error: string | null
  pagination: AuditLogPagination | null
  filters: AuditLogFilters

  fetchLogs: (filters?: Partial<AuditLogFilters>) => Promise<void>
  setFilter: (key: keyof AuditLogFilters, value: any) => void
  resetFilters: () => void
  invalidate: () => void
}

const DEFAULT_FILTERS: AuditLogFilters = {
  page: 1,
  limit: 20,
  action: '',
  startDate: '',
  endDate: '',
}

export const useAuditLogStore = create<AuditLogState>((set, get) => ({
  logs: [],
  loading: false,
  loaded: false,
  error: null,
  pagination: null,
  filters: { ...DEFAULT_FILTERS },

  fetchLogs: async (overrides?: Partial<AuditLogFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[AuditLogStore] Serving from cache — skipping API call')
      return
    }
    console.log('[AuditLogStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const params: any = { page: filters.page, limit: filters.limit }
      if (filters.action) params.action = filters.action
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate

      const res = await auditLogService.getAll(params)
      set({
        logs: res.data || [],
        pagination: (res as any).pagination || null,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch audit logs', logs: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchLogs(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchLogs(DEFAULT_FILTERS)
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchLogs()
  },
}))
