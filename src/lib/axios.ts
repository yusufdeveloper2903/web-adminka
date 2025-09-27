import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
})

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Skip token refresh for authentication endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/authenticate") ||
      originalRequest.url?.includes("/staffs/login") ||
      originalRequest.url?.includes("/auth/refresh")

    // Handle 401 (Unauthorized) or 403 (Forbidden) - token expired or invalid
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
      // If we haven't tried to refresh yet, try refresh token
      if (!originalRequest._retry && error.response?.status === 401) {
        originalRequest._retry = true

        const refreshToken = localStorage.getItem("refresh_token")

        if (refreshToken) {
          try {
            // Try to refresh the token
            const response = await axios.post("/auth/refresh", {
              refreshToken
            })

            const payload: any = response.data.data
            const accessToken = payload.accessToken ?? payload.access
            const newRefreshToken = payload.refreshToken ?? payload.refresh

            // Update tokens in localStorage
            localStorage.setItem("access_token", accessToken)
            localStorage.setItem("refresh_token", newRefreshToken)

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } catch (refreshError) {
            // Refresh failed, logout user
            console.error("Token refresh failed:", refreshError)
            handleLogout()
            return Promise.reject(refreshError)
          }
        } else {
          // No refresh token, logout user
          handleLogout()
        }
      } else {
        // 403 or refresh already tried, logout user
        handleLogout()
      }
    }

    return Promise.reject(error)
  }
)

// Helper function to handle logout
const handleLogout = () => {
  // Clear tokens
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")

  // Update auth store
  import("@/store/auth-store").then(({ useAuthStore }) => {
    const { setUser } = useAuthStore.getState()
    setUser(null)
  })

  // Only redirect if we're not already on the login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

export default api
