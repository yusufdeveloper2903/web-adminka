import { useEffect } from "react"
import { useAuthStore } from "@/store"

/**
 * Hook to initialize authentication state on app startup
 * Should be called once in the root component
 */
export const useAuthInit = () => {
  const { checkAuthStatus, setLoading } = useAuthStore()

  useEffect(() => {
    // Set loading to true initially
    setLoading(true)

    // Check authentication status
    checkAuthStatus()

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token") {
        checkAuthStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [checkAuthStatus, setLoading])
}
