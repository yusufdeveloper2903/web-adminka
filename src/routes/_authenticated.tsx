import { createRoute, Outlet, redirect } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"

// Authentication check function
const checkAuth = async () => {
  try {
    const token = localStorage.getItem('access_token')
    
    // If no token, redirect to login
    if (!token) {
      throw redirect({
        to: '/login'
      })
    }
    
    // Optional: Validate token with a simple API call
    // This will trigger axios interceptor if token is invalid
    try {
      // You can make a simple API call here to validate token
      // For now, we'll rely on axios interceptor to handle invalid tokens
    } catch (tokenError) {
      // If token validation fails, clear tokens and redirect
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      throw redirect({
        to: '/login'
      })
    }
    
  } catch (error) {
    // If localStorage is not available or any other error, redirect to login
    console.warn('Authentication check failed:', error)
    throw redirect({
      to: '/login'
    })
  }
}

export const AuthenticatedRoute = createRoute({
  id: 'authenticated',
  getParentRoute: () => RootRoute,
  beforeLoad: checkAuth,
  component: () => <Outlet />
})
