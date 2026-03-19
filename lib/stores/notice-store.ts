import { create } from 'zustand'
import { noticeService } from '../api-services'
import type { Notice } from '../types'

interface NoticeFilters {
  page: number
  search: string
  limit: number
}

interface NoticeState {
  notices: Notice[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: NoticeFilters

  fetchNotices: (filters?: Partial<NoticeFilters>) => Promise<void>
  setFilter: (key: keyof NoticeFilters, value: any) => void
  resetFilters: () => void
  deleteNotice: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: NoticeFilters = {
  page: 1,
  search: '',
  limit: 10,
}

export const useNoticeStore = create<NoticeState>((set, get) => ({
  notices: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchNotices: async (overrides?: Partial<NoticeFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[NoticeStore] Serving from cache — skipping API call')
      return
    }
    console.log('[NoticeStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await noticeService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
      })
      set({
        notices: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch notices', notices: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchNotices(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchNotices(DEFAULT_FILTERS)
  },

  deleteNotice: async (id: string) => {
    await noticeService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchNotices()
  },
}))
