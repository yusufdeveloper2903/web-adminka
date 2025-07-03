import { AppSidebar, Header } from "@/components/shared"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </div>
  )
})
