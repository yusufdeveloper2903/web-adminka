/**
 * Authentication utility functions
 */

export const logout = () => {
  // Clear tokens from localStorage
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  
  // Redirect to login page
  window.location.href = '/login'
}

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token')
  return !!token
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token')
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token')
}