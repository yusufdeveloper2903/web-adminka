import { createRoute, Outlet, redirect } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"

// Authentication check function
const checkAuth = () => {
  try {
    const token = localStorage.getItem('access_token')
    
    // If no token, redirect to login
    if (!token) {
      throw redirect({
        to: '/login'
      })
    }
    
    // Optional: Add token expiration check here if needed
    // For now, we rely on the axios interceptor to handle expired tokens
    
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
