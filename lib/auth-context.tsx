import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import { User, School, AuthResponse, LoginCredentials, RegisterData } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  currentSchool: School | null;
  schools: { schoolId: string; roles: string[] }[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ requiresSchoolSelection?: boolean; schools?: any[] }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  selectSchool: (schoolId: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'sqoolify_token';
const REFRESH_TOKEN_KEY = 'sqoolify_refresh_token';
const USER_KEY = 'sqoolify_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<{ schoolId: string; roles: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      setToken(savedToken);
      setRefreshToken(savedRefreshToken);
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.schools?.length > 0) {
          setSchools(parsedUser.schools);
        }
      } catch (e) {
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveTokens = (accessToken: string, refresh: string) => {
    setToken(accessToken);
    setRefreshToken(refresh);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  };

  const saveUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    if (userData.schools?.length > 0) {
      setSchools(userData.schools);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setCurrentSchool(null);
    setSchools([]);
    setPendingUserId(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    if (response.data.requiresSchoolSelection) {
      setPendingUserId(response.data.userId!);
      setRefreshToken(response.data.refreshToken!);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken!);
      return {
        requiresSchoolSelection: true,
        schools: response.data.schools
      };
    }

    saveTokens(response.data.accessToken!, response.data.refreshToken!);
    saveUser(response.data.user!);
    return {};
  };

  const register = async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    saveTokens(response.data.accessToken!, response.data.refreshToken!);
    saveUser(response.data.user!);
  };

  const selectSchool = async (schoolId: string) => {
    const userId = pendingUserId || user?._id;
    const refresh = refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!userId || !refresh) {
      throw new Error('No pending login session');
    }

    const response = await api.post<AuthResponse>('/auth/select-school', {
      userId,
      schoolId,
      refreshToken: refresh,
    });

    saveTokens(response.data.accessToken!, response.data.refreshToken!);
    saveUser(response.data.user!);
    setPendingUserId(null);
  };

  const refreshTokens = async () => {
    const refresh = refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh || !user?._id) return;

    try {
      const response = await api.post<{ data: { accessToken: string; refreshToken: string } }>(
        '/auth/refresh',
        { userId: user._id, refreshToken: refresh }
      );
      saveTokens(response.data.accessToken, response.data.refreshToken);
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const updateUser = (userData: User) => {
    saveUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        currentSchool,
        schools,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        selectSchool,
        refreshTokens,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // SSR fallback - return safe defaults when rendered on server
    if (typeof window === 'undefined') {
      return {
        user: null,
        token: null,
        refreshToken: null,
        currentSchool: null,
        schools: [],
        isLoading: true,
        isAuthenticated: false,
        login: async () => ({}),
        register: async () => {},
        logout: () => {},
        selectSchool: async () => {},
        refreshTokens: async () => {},
        updateUser: () => {},
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
