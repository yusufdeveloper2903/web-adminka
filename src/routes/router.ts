import { LoginPage, UsersPage } from "@/pages"
import { ResetPasswordPage } from "@/pages/ResetPassword"
import { createRoute, createRouter, redirect } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"
import { AuthenticatedRoute } from "./_authenticated"
import { Layout } from "@/components/shared"

// Layout route that wraps authenticated pages
const AppLayoutRoute = createRoute({
  id: "layout",
  getParentRoute: () => AuthenticatedRoute,
  component: Layout
})

// Login route (public)
const loginRoute = createRoute({
  path: "/login",
  getParentRoute: () => RootRoute,
  component: LoginPage
})

// Reset Password route (public)
const resetPasswordRoute = createRoute({
  path: "/reset-password",
  getParentRoute: () => RootRoute,
  component: ResetPasswordPage
})

// Index route - redirect to users if authenticated, otherwise to login
const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => RootRoute,
  beforeLoad: () => {
    const token = localStorage.getItem("access_token")
    if (token) {
      throw redirect({ to: "/users" })
    } else {
      throw redirect({ to: "/login" })
    }
  }
})

const usersRoute = createRoute({
  path: "/users",
  getParentRoute: () => AppLayoutRoute,
  component: UsersPage
})

const routeTree = RootRoute.addChildren([
  indexRoute,
  loginRoute,
  resetPasswordRoute,
  AuthenticatedRoute.addChildren([
    AppLayoutRoute.addChildren([usersRoute])
  ])
])

export const router = createRouter({ routeTree })
