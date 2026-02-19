import { create } from 'zustand'
import { authService } from '../api-services'
import type { User, LoginCredentials, RegisterData } from '../types'

const TOKEN_KEY = 'sqoolify_token'
const REFRESH_TOKEN_KEY = 'sqoolify_refresh_token'
const USER_KEY = 'sqoolify_user'

function isBrowser() {
  return typeof window !== 'undefined'
}

function readLocalStorage() {
  if (!isBrowser()) return { token: null, refreshToken: null, user: null, hasAuthHandoff: false }

  const hasAuthHandoff = new URLSearchParams(window.location.search).has('_auth')
  const token = localStorage.getItem(TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  const userStr = localStorage.getItem(USER_KEY)
  let user: User | null = null
  if (userStr) {
    try { user = JSON.parse(userStr) } catch { localStorage.removeItem(USER_KEY) }
  }
  return { token, refreshToken, user, hasAuthHandoff }
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  pendingUserId: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  selectSchool: (schoolId: string) => Promise<void>
  refreshTokens: () => Promise<void>
  updateUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  _hydrate: () => void
}

export type AuthStore = AuthState & AuthActions

const initial = readLocalStorage()

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: initial.user,
  token: initial.token,
  refreshToken: initial.refreshToken,
  isLoading: !!initial.token || initial.hasAuthHandoff,
  pendingUserId: null,

  setTokens(accessToken: string, refresh: string) {
    set({ token: accessToken, refreshToken: refresh })
    if (isBrowser()) {
      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    }
  },

  clearAuth() {
    set({ user: null, token: null, refreshToken: null, pendingUserId: null })
    if (isBrowser()) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  _hydrate() {
    if (!isBrowser()) return
    const { token, user } = get()
    if (token && user) {
      authService.getProfile()
        .then((response) => {
          const freshUser = response.data
          if (freshUser) {
            set({ user: freshUser })
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
          }
        })
        .catch(() => {})
        .finally(() => set({ isLoading: false }))
    } else {
      set({ isLoading: false })
    }
  },

  async login(credentials: LoginCredentials) {
    const response = await authService.login(credentials)
    get().setTokens(response.data.accessToken!, response.data.refreshToken!)
    const user = response.data.user!
    set({ user })
    if (isBrowser()) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  async register(data: RegisterData) {
    const response = await authService.register(data)
    get().setTokens(response.data.accessToken!, response.data.refreshToken!)
    const user = response.data.user!
    set({ user })
    if (isBrowser()) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  logout() {
    get().clearAuth()
    if (isBrowser()) window.location.href = '/login'
  },

  async selectSchool(schoolId: string) {
    const { pendingUserId, user, refreshToken: rt } = get()
    const userId = pendingUserId || user?._id
    const refresh = rt || (isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null)
    if (!userId || !refresh) throw new Error('No pending login session')

    const response = await authService.selectSchool(userId, schoolId, refresh)
    get().setTokens(response.data.accessToken!, response.data.refreshToken!)
    const freshUser = response.data.user!
    set({ user: freshUser, pendingUserId: null })
    if (isBrowser()) localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
  },

  async refreshTokens() {
    const { refreshToken: rt, user } = get()
    const refresh = rt || (isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null)
    if (!refresh || !user?._id) return

    try {
      const response = await authService.refresh(user._id, refresh)
      get().setTokens(response.data.accessToken, response.data.refreshToken)
    } catch (error) {
      get().clearAuth()
      throw error
    }
  },

  updateUser(userData: User) {
    set({ user: userData })
    if (isBrowser()) localStorage.setItem(USER_KEY, JSON.stringify(userData))
  },
}))

export function getStoredToken(): string | null {
  if (!isBrowser()) return null
  return useAuthStore.getState().token || localStorage.getItem(TOKEN_KEY)
}
