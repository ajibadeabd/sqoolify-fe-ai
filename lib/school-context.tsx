import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useSchoolStore } from './stores/school-store'
import type { PublicSchool } from './types'

export type SchoolInfo = PublicSchool

interface SchoolContextType {
  school: SchoolInfo | null
  slug: string | null
}

const SchoolContext = createContext<SchoolContextType>({
  school: null,
  slug: null,
})

interface SchoolProviderProps {
  children: ReactNode
  school?: SchoolInfo | null
  slug?: string | null
}

export function SchoolProvider({ children, school = null, slug = null }: SchoolProviderProps) {
  useEffect(() => {
    useSchoolStore.getState().setSchool(school, slug)
  }, [school?._id, slug])

  return (
    <SchoolContext.Provider value={{ school, slug }}>
      {children}
    </SchoolContext.Provider>
  )
}

export function useSchool(): SchoolContextType {
  return useContext(SchoolContext)
}
