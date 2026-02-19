import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useSchoolStore } from './stores/school-store'
import { darkenHex, hexToRgb } from './color-utils'
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

  useEffect(() => {
    const primary = school?.siteConfig?.primaryColor || '#3B82F6'
    const secondary = school?.siteConfig?.secondaryColor || darkenHex(primary, 0.2)
    const root = document.documentElement
    root.style.setProperty('--color-primary', primary)
    root.style.setProperty('--color-secondary', secondary)
    root.style.setProperty('--color-primary-rgb', hexToRgb(primary))
    root.style.setProperty('--color-secondary-rgb', hexToRgb(secondary))
  }, [school?.siteConfig?.primaryColor, school?.siteConfig?.secondaryColor])

  return (
    <SchoolContext.Provider value={{ school, slug }}>
      {children}
    </SchoolContext.Provider>
  )
}

export function useSchool(): SchoolContextType {
  return useContext(SchoolContext)
}
