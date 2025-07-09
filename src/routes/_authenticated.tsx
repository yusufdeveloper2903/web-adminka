import { createRootRoute, Outlet } from "@tanstack/react-router"

export const AuthRoute = createRootRoute({
  component: () => <Outlet />
})
