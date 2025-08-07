import { Outlet } from "@tanstack/react-router"
import AppSidebar from "./AppSidebar/AppSidebar"
import Header from "./Header/Header"
import AppDrawer from "../AppDrawer"

const Layout = () => {
  return (
    <>
      {/* Background layer to prevent black background showing during scroll overflow */}
      <div className="bg-blue-light dark:bg-background fixed inset-0 -z-10" />
      
      <div className="bg-blue-light dark:bg-background flex h-screen w-full p-2">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="dark:border-background/80 dark:bg-card ml-2 flex-1 overflow-x-hidden overflow-y-auto rounded-[8px] border bg-white">
            <Outlet />
          </main>
          <AppDrawer />
        </div>
      </div>
    </>
  )
}

export default Layout
