import { create } from 'zustand'
import { schoolService } from '../api-services'
import type { PublicSchool, School } from '../types'

interface SchoolState {
  school: PublicSchool | null
  slug: string | null
  ownedSchools: School[]
  ownedSchoolsLoaded: boolean
  ownedSchoolsLoading: boolean
}

interface SchoolActions {
  setSchool: (school: PublicSchool | null, slug: string | null) => void
  fetchOwnedSchools: () => Promise<void>
  addOwnedSchool: (school: School) => void
}

export type SchoolStore = SchoolState & SchoolActions

export const useSchoolStore = create<SchoolStore>((set, get) => ({
  school: null,
  slug: null,
  ownedSchools: [],
  ownedSchoolsLoaded: false,
  ownedSchoolsLoading: false,

  setSchool(school, slug) {
    set({ school, slug })
  },

  async fetchOwnedSchools() {
    if (get().ownedSchoolsLoaded || get().ownedSchoolsLoading) return
    set({ ownedSchoolsLoading: true })
    try {
      const res = await schoolService.getMySchools()
      set({ ownedSchools: res.data || [], ownedSchoolsLoaded: true })
    } catch {
      set({ ownedSchoolsLoaded: true })
    } finally {
      set({ ownedSchoolsLoading: false })
    }
  },

  addOwnedSchool(school) {
    set((state) => ({ ownedSchools: [...state.ownedSchools, school] }))
  },
}))
