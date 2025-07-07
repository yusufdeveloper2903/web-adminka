import {
  CompaniesPage,
  ProfilePage,
  ReportsPage,
  RoutesPage,
  SystemPage,
  TripsPage,
  TrucksPage,
  UsersPage
} from "@/pages"
import { createRoute, createRouter, type RouteComponent } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"

const r = (path: string, component: RouteComponent) =>
  createRoute({
    path,
    getParentRoute: () => rootRoute,
    component
  })

const routeTree = rootRoute.addChildren([
  r("trips", TripsPage),
  r("companies", CompaniesPage),
  r("profile", ProfilePage),
  r("trucks", TrucksPage),
  r("users", UsersPage),
  r("system", SystemPage),
  r("routes", RoutesPage),
  r("reports", ReportsPage)
])

export const router = createRouter({ routeTree })
