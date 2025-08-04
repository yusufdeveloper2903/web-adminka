import { Outlet } from "@tanstack/react-router"
import AppSidebar from "./AppSidebar/AppSidebar"
import Header from "./Header/Header"
import AppDrawer from "../AppDrawer"

const Layout = () => {
  return (
    <div className="bg-blue-light flex h-screen w-full p-2">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="ml-2 flex-1 overflow-x-hidden overflow-y-auto rounded-[8px] border bg-white">
          <Outlet />
        </main>
        <AppDrawer />
      </div>
    </div>
  )
}

export default Layout
