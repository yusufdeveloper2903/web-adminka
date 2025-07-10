import { Outlet } from "@tanstack/react-router"
import AppSidebar from "./AppSidebar/AppSidebar"
import Header from "./Header/Header"
import AppDrawer from "../AppDrawer"

const Layout = () => {
  return (
    <div className="bg-background flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
        <AppDrawer />
      </div>
      {/* <TanStackRouterDevtools /> */}
    </div>
  )
}

export default Layout
