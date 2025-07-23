import { createRoute, Outlet, redirect } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"

// Authentication check function
const checkAuth = () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
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
