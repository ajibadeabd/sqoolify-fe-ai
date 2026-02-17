import { createContext, useContext, ReactNode } from 'react';
import type { SiteConfig } from './types';

export interface SchoolInfo {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  motto?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  siteConfig?: SiteConfig;
}

interface SchoolContextType {
  school: SchoolInfo | null;
  slug: string | null;
}

const SchoolContext = createContext<SchoolContextType>({
  school: null,
  slug: null,
});

interface SchoolProviderProps {
  children: ReactNode;
  school?: SchoolInfo | null;
  slug?: string | null;
}

export function SchoolProvider({ children, school = null, slug = null }: SchoolProviderProps) {
  return (
    <SchoolContext.Provider value={{ school, slug }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool(): SchoolContextType {
  return useContext(SchoolContext);
}
// d3d345a82d354b61.vercel-dns-017.com.