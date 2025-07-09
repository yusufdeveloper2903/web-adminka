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
import { createRoute, createRouter, type RouteComponent } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"
import { Layout } from "@/components/shared"

const AppLayoutRoute = createRoute({
  path: "/",
  getParentRoute: () => RootRoute,
  component: Layout
})

const r = (parent: any, path: string, component: RouteComponent) =>
  createRoute({
    path,
    getParentRoute: () => parent,
    component
  })

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

const loginRoute = r(RootRoute, "login", LoginPage)

const routeTree = RootRoute.addChildren([AppLayoutRoute.addChildren(mainRoutes), loginRoute])

export const router = createRouter({ routeTree })
