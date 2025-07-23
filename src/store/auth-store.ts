import { create } from "zustand"
import type { IUser } from "@/types"
import { isAuthenticated as checkIsAuthenticated, logout as performLogout } from "@/lib/auth"

interface AuthState {
  isAuthenticated: boolean
  user: IUser | null
  isLoading: boolean
  login: (user: IUser) => void
  logout: () => void
  setUser: (user: IUser | null) => void
  setLoading: (loading: boolean) => void
  checkAuthStatus: () => void
}

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  
  login: (user: IUser) => {
    set({
      isAuthenticated: true,
      user,
      isLoading: false
    })
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false
    })
    performLogout()
  },
  
  setUser: (user: IUser | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false
    })
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  checkAuthStatus: () => {
    const authStatus = checkIsAuthenticated()
    set({
      isAuthenticated: authStatus,
      user: authStatus ? get().user : null,
      isLoading: false
    })
  }
}))