/**
 * JWT Token validation utilities
 */

interface JWTPayload {
  exp?: number // Expiration time (Unix timestamp)
  iat?: number // Issued at time
  sub?: string // Subject (usually user ID)
  [key: string]: any
}

/**
 * Decode JWT token payload without verification
 */
export const decodeJWTPayload = (token: string): JWTPayload | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    // Decode base64url payload
    const payload = parts[1]
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4)
    const decodedPayload = atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"))

    return JSON.parse(decodedPayload)
  } catch (error) {
    console.warn("Failed to decode JWT payload:", error)
    return null
  }
}

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWTPayload(token)

  if (!payload || !payload.exp) {
    // If no expiration time, consider it invalid
    return true
  }

  // Convert exp from seconds to milliseconds and compare with current time
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()

  return currentTime >= expirationTime
}

/**
 * Check if JWT token format is valid
 */
export const isValidJWTFormat = (token: string): boolean => {
  if (!token || typeof token !== "string") {
    return false
  }

  // JWT should have exactly 3 parts separated by dots
  const parts = token.split(".")
  if (parts.length !== 3) {
    return false
  }

  // Each part should be base64url encoded (no padding required)
  const base64urlRegex = /^[A-Za-z0-9_-]+$/

  return parts.every((part) => part.length > 0 && base64urlRegex.test(part))
}

/**
 * Comprehensive token validation
 */
export const validateToken = (
  token: string | null
): {
  isValid: boolean
  reason?: string
  payload?: JWTPayload
} => {
  // Check if token exists
  if (!token) {
    return { isValid: false, reason: "Token not found" }
  }

  // Check JWT format
  if (!isValidJWTFormat(token)) {
    return { isValid: false, reason: "Invalid JWT format" }
  }

  // Decode payload
  const payload = decodeJWTPayload(token)
  if (!payload) {
    return { isValid: false, reason: "Failed to decode token payload" }
  }

  // Check expiration
  if (isTokenExpired(token)) {
    return { isValid: false, reason: "Token expired", payload }
  }

  return { isValid: true, payload }
}

/**
 * Get token expiration time in human readable format
 */
export const getTokenExpirationTime = (token: string): string | null => {
  const payload = decodeJWTPayload(token)

  if (!payload || !payload.exp) {
    return null
  }

  const expirationDate = new Date(payload.exp * 1000)
  return expirationDate.toLocaleString()
}

/**
 * Get time remaining until token expires
 */
export const getTokenTimeRemaining = (token: string): number | null => {
  const payload = decodeJWTPayload(token)

  if (!payload || !payload.exp) {
    return null
  }

  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()
  const timeRemaining = expirationTime - currentTime

  return timeRemaining > 0 ? timeRemaining : 0
}
