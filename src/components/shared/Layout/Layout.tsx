import { Outlet } from "@tanstack/react-router"
import Header from "./Header"
import AppSidebar from "./AppSidebar"

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
      {/* <TanStackRouterDevtools /> */}
    </div>
  )
}

export default Layout
