import { createContext, useContext, ReactNode } from 'react';

export interface SchoolInfo {
  _id: string;
  name: string;
  slug: string;
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
