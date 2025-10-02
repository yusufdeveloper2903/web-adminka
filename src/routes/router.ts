import { QuestionsPage } from "@/pages"
import { createRoute, createRouter, redirect } from "@tanstack/react-router"
import { Route as RootRoute } from "./__root"
import { Layout } from "@/components/shared"

// Layout route that wraps authenticated pages
const AppLayoutRoute = createRoute({
  id: "layout",
  getParentRoute: () => RootRoute,
  component: Layout
})

// Index route - always redirect to questions
const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => RootRoute,
  beforeLoad: () => {
    throw redirect({ to: "/questions" })
  }
})

const questionsRoute = createRoute({
  path: "/questions",
  getParentRoute: () => AppLayoutRoute,
  component: QuestionsPage
})

// Catch-all: redirect all other routes to /questions
const notFoundRedirectRoute = createRoute({
  path: "*",
  getParentRoute: () => RootRoute,
  beforeLoad: () => {
    throw redirect({ to: "/questions" })
  },
  component: () => null
})

const routeTree = RootRoute.addChildren([
  indexRoute,
  AppLayoutRoute.addChildren([questionsRoute]),
  notFoundRedirectRoute
])

export const router = createRouter({ routeTree })
