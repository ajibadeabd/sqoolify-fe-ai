import { create } from 'zustand'
import { examService } from '../api-services'
import type { Exam } from '../types'

interface ExamFilters {
  page: number
  search: string
  classId: string
  subjectId: string
  term: string
  limit: number
}

interface ExamState {
  exams: Exam[]
  loading: boolean
  loaded: boolean
  error: string | null
  total: number
  totalPages: number
  filters: ExamFilters

  fetchExams: (filters?: Partial<ExamFilters>) => Promise<void>
  setFilter: (key: keyof ExamFilters, value: any) => void
  resetFilters: () => void
  deleteExam: (id: string) => Promise<void>
  invalidate: () => void
}

const DEFAULT_FILTERS: ExamFilters = {
  page: 1,
  search: '',
  classId: '',
  subjectId: '',
  term: '',
  limit: 10,
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  totalPages: 1,
  filters: { ...DEFAULT_FILTERS },

  fetchExams: async (overrides?: Partial<ExamFilters>) => {
    if (!overrides && get().loaded) {
      console.log('[ExamStore] Serving from cache — skipping API call')
      return
    }
    console.log('[ExamStore] Fetching from API', overrides || 'initial load')

    const filters = { ...get().filters, ...overrides }
    if (overrides) set({ filters })

    set({ loading: true, error: null })
    try {
      const res = await examService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        classId: filters.classId || undefined,
        subjectId: filters.subjectId || undefined,
        term: filters.term || undefined,
      })
      set({
        exams: res.data || [],
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0,
        loaded: true,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch exams', exams: [] })
    } finally {
      set({ loading: false })
    }
  },

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value }
    if (key !== 'page') filters.page = 1
    set({ filters })
    get().fetchExams(filters)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchExams(DEFAULT_FILTERS)
  },

  deleteExam: async (id: string) => {
    await examService.delete(id)
    get().invalidate()
  },

  invalidate: () => {
    set({ loaded: false })
    get().fetchExams()
  },
}))
