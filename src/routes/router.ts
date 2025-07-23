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
import { createRoute, createRouter, redirect, type RouteComponent } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"
import { AuthenticatedRoute } from "./_authenticated"
import { Layout } from "@/components/shared"

// Layout route that wraps authenticated pages
const AppLayoutRoute = createRoute({
  path: "/",
  getParentRoute: () => AuthenticatedRoute,
  component: Layout
})

// Helper function to create routes
const r = (parent: any, path: string, component: RouteComponent) =>
  createRoute({
    path,
    getParentRoute: () => parent,
    component
  })

// All main application routes (protected)
const mainRoutes = [
  r(AppLayoutRoute, "trips", TripsPage),
  r(AppLayoutRoute, "companies", CompaniesPage),
  r(AppLayoutRoute, "profile", ProfilePage),
  r(AppLayoutRoute, "trucks", TrucksPage),
  r(AppLayoutRoute, "users", UsersPage),
  r(AppLayoutRoute, "system", SystemPage),
  r(AppLayoutRoute, "routes", RoutesPage),
  r(AppLayoutRoute, "reports", ReportsPage)
]

// Login route (public)
const loginRoute = createRoute({
  path: "/login",
  getParentRoute: () => RootRoute,
  component: LoginPage
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
  AuthenticatedRoute.addChildren([AppLayoutRoute.addChildren(mainRoutes)])
])

export const router = createRouter({ routeTree })
