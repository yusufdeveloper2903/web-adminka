import {
  CompaniesPage,
  DispatchersPage,
  LoginPage,
  ReportsPage,
  RoutesPage,
  SystemPage,
  TripsPage,
  TrucksPage,
  UsersPage,
  ShopsPage
} from "@/pages"
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

// Main application routes (protected)
const tripsRoute = createRoute({
  path: "/trips",
  getParentRoute: () => AppLayoutRoute,
  component: TripsPage
})

const companiesRoute = createRoute({
  path: "/companies",
  getParentRoute: () => AppLayoutRoute,
  component: CompaniesPage
})

const trucksRoute = createRoute({
  path: "/trucks",
  getParentRoute: () => AppLayoutRoute,
  component: TrucksPage
})

const usersRoute = createRoute({
  path: "/users",
  getParentRoute: () => AppLayoutRoute,
  component: UsersPage
})

const systemRoute = createRoute({
  path: "/system",
  getParentRoute: () => AppLayoutRoute,
  component: SystemPage
})

const routesRoute = createRoute({
  path: "/routes",
  getParentRoute: () => AppLayoutRoute,
  component: RoutesPage
})

const reportsRoute = createRoute({
  path: "/reports",
  getParentRoute: () => AppLayoutRoute,
  component: ReportsPage
})

const dispatchersRoute = createRoute({
  path: "dispatchers",
  getParentRoute: () => AppLayoutRoute,
  component: DispatchersPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "dispatchers"
    }
  }
})

const shopsRoute = createRoute({
  path: "/shops",
  getParentRoute: () => AppLayoutRoute,
  component: ShopsPage
})

const routeTree = RootRoute.addChildren([
  indexRoute,
  loginRoute,
  resetPasswordRoute,
  AuthenticatedRoute.addChildren([
    AppLayoutRoute.addChildren([
      tripsRoute,
      companiesRoute,
      trucksRoute,
      dispatchersRoute,
      usersRoute,
      systemRoute,
      routesRoute,
      reportsRoute,
      shopsRoute
    ])
  ])
])

export const router = createRouter({ routeTree })
