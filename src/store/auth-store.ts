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
    const token = localStorage.getItem("access_token")

    if (!token) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false
      })
      return
    }

    // Import token validation
    import("@/lib/token-utils")
      .then(({ validateToken }) => {
        const validation = validateToken(token)

        if (validation.isValid) {
          set({
            isAuthenticated: true,
            user: get().user, // Keep existing user data
            isLoading: false
          })
        } else {
          console.warn("Token validation failed in store:", validation.reason)

          // Clear invalid tokens
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")

          set({
            isAuthenticated: false,
            user: null,
            isLoading: false
          })
        }
      })
      .catch(() => {
        // Fallback to basic check if import fails
        const authStatus = checkIsAuthenticated()
        set({
          isAuthenticated: authStatus,
          user: authStatus ? get().user : null,
          isLoading: false
        })
      })
  }
}))
