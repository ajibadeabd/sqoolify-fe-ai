import { create } from 'zustand'
import type { PublicSchool } from '../types'

interface SchoolState {
  school: PublicSchool | null
  slug: string | null
}

interface SchoolActions {
  setSchool: (school: PublicSchool | null, slug: string | null) => void
}

export type SchoolStore = SchoolState & SchoolActions

export const useSchoolStore = create<SchoolStore>((set) => ({
  school: null,
  slug: null,
  setSchool(school, slug) {
    set({ school, slug })
  },
}))
