import type { IApiError } from "@/types"

/**
 * Extract user-friendly error message from API error response
 */
export const getErrorMessage = (error: any): string => {
  // Check if it's an axios error with response
  if (error?.response?.data) {
    const apiError = error.response.data as IApiError

    // Return the main message
    if (apiError.message) {
      return apiError.message
    }

    // If there are specific field errors, return the first one
    if (apiError.errors && apiError.errors.length > 0) {
      return apiError.errors[0]
    }
  }

  // Check for network errors
  if (error?.code === "NETWORK_ERROR" || error?.message?.includes("Network Error")) {
    return "Network error. Please check your connection and try again."
  }

  // Check for timeout errors
  if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    return "Request timeout. Please try again."
  }

  // Generic error message
  return error?.message || "An unexpected error occurred. Please try again."
}

/**
 * Map common HTTP status codes to user-friendly messages
 */
export const getStatusErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input."
    case 401:
      return "Invalid credentials. Please check your email and password."
    case 403:
      return "Access denied. You don't have permission to perform this action."
    case 404:
      return "Service not found. Please try again later."
    case 429:
      return "Too many attempts. Please wait a moment and try again."
    case 500:
      return "Server error. Please try again later."
    case 503:
      return "Service temporarily unavailable. Please try again later."
    default:
      return "An error occurred. Please try again."
  }
}
