import { createRoute, Outlet, redirect } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"
import { validateToken } from "@/lib/token-utils"

// Authentication check function
const checkAuth = () => {
  try {
    const token = localStorage.getItem("access_token")

    // If no token, redirect to login
    if (!token) {
      throw redirect({
        to: "/login"
      })
    }

    // Validate token format and expiration
    const validation = validateToken(token)

    if (!validation.isValid) {
      console.warn("Token validation failed:", validation.reason)

      // Clear invalid tokens
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      // Redirect to login
      throw redirect({
        to: "/login"
      })
    }

    // Token is valid - user can proceed
    // If token expires during usage, axios interceptor will handle it
  } catch (error) {
    // If localStorage is not available or any other error, redirect to login
    console.warn("Authentication check failed:", error)
    throw redirect({
      to: "/login"
    })
  }
}

export const AuthenticatedRoute = createRoute({
  id: "authenticated",
  getParentRoute: () => RootRoute,
  beforeLoad: checkAuth,
  component: () => <Outlet />
})
