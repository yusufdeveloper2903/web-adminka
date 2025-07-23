import {
  CompaniesPage,
  LoginPage,
  ProfilePage,
  ReportsPage,
  RoutesPage,
  SystemPage,
  TripsPage,
  TrucksPage,
  UsersPage
} from "@/pages"
import { ResetPasswordPage } from "@/pages/ResetPassword"
import { createRoute, createRouter, redirect, type RouteComponent } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"
import { AuthenticatedRoute } from "./_authenticated"
import { Layout } from "@/components/shared"

// Helper function to create routes
const r = (parent: any, path: string, component: RouteComponent) =>
  createRoute({
    path,
    getParentRoute: () => parent,
    component
  })

// Layout route that wraps authenticated pages
const AppLayoutRoute = createRoute({
  id: "layout",
  getParentRoute: () => AuthenticatedRoute,
  component: Layout
})

// All main application routes (protected)
const mainRoutes = [
  r(AppLayoutRoute, "/trips", TripsPage),
  r(AppLayoutRoute, "/companies", CompaniesPage),
  r(AppLayoutRoute, "/profile", ProfilePage),
  r(AppLayoutRoute, "/trucks", TrucksPage),
  r(AppLayoutRoute, "/users", UsersPage),
  r(AppLayoutRoute, "/system", SystemPage),
  r(AppLayoutRoute, "/routes", RoutesPage),
  r(AppLayoutRoute, "/reports", ReportsPage)
]

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

// Index route - redirect to trips if authenticated, otherwise to login
const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => RootRoute,
  beforeLoad: () => {
    const token = localStorage.getItem("access_token")
    if (token) {
      throw redirect({ to: "/trips" })
    } else {
      throw redirect({ to: "/login" })
    }
  }
})

const routeTree = RootRoute.addChildren([
  indexRoute,
  loginRoute,
  resetPasswordRoute,
  AuthenticatedRoute.addChildren([AppLayoutRoute.addChildren(mainRoutes)])
])

export const router = createRouter({ routeTree })
