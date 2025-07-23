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
    const isAuthEndpoint = originalRequest.url?.includes('/authenticate') || 
                          originalRequest.url?.includes('/auth/refresh')

    // If 401 and we haven't already tried to refresh and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refresh_token")

      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post("/auth/refresh", {
            refreshToken
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data.data

          // Update tokens in localStorage
          localStorage.setItem("access_token", accessToken)
          localStorage.setItem("refresh_token", newRefreshToken)

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = "/login"
          }
          
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, clear tokens and redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
