import { LoginPage, StaffsPage, TasksPage, TasksTestPage } from "@/pages"
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

// Index route - redirect to staffs if authenticated, otherwise to login
const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => RootRoute,
  beforeLoad: () => {
    const token = localStorage.getItem("access_token")
    if (token) {
      throw redirect({ to: "/staffs" })
    } else {
      throw redirect({ to: "/login" })
    }
  }
})

const staffsRoute = createRoute({
  path: "/staffs",
  getParentRoute: () => AppLayoutRoute,
  component: StaffsPage
})

const tasksRoute = createRoute({
  path: "/tasks",
  getParentRoute: () => AppLayoutRoute,
  component: TasksPage
})

const tasksTestRoute = createRoute({
  path: "/tasks/$id",
  getParentRoute: () => AppLayoutRoute,
  component: TasksTestPage
})

const routeTree = RootRoute.addChildren([
  indexRoute,
  loginRoute,
  AuthenticatedRoute.addChildren([AppLayoutRoute.addChildren([staffsRoute, tasksRoute, tasksTestRoute])])
])

export const router = createRouter({ routeTree })
