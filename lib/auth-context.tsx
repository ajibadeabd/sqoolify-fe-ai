import { useAuthStore, getStoredToken } from './stores/auth-store'
import type { User, LoginCredentials, RegisterData } from './types'

interface AuthContextType {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  selectSchool: (schoolId: string) => Promise<void>
  refreshTokens: () => Promise<void>
  updateUser: (user: User) => void
}

export function useAuth(): AuthContextType {
  const store = useAuthStore()

  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isLoading: true,
      isAuthenticated: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      selectSchool: async () => {},
      refreshTokens: async () => {},
      updateUser: () => {},
    }
  }

  return {
    user: store.user,
    token: store.token,
    refreshToken: store.refreshToken,
    isLoading: store.isLoading,
    isAuthenticated: !!store.token && !!store.user,
    login: store.login,
    register: store.register,
    logout: store.logout,
    selectSchool: store.selectSchool,
    refreshTokens: store.refreshTokens,
    updateUser: store.updateUser,
  }
}

export { getStoredToken }
