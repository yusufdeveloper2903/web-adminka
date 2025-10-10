import { Outlet } from "@tanstack/react-router"
import Header from "./Header/Header"
import AppDrawer from "../AppDrawer"

const Layout = () => {
  return (
    <>
      {/* Background layer to prevent black background showing during scroll overflow */}
      <div className="bg-blue-light dark:bg-background fixed inset-0 -z-10" />

      <div className="bg-blue-light dark:bg-background flex h-screen w-full p-2">
        <div className="flex flex-1 flex-col overflow-hidden min-h-0 min-w-0">
          <Header />
          <main className="dark:border-background/80 dark:bg-card flex-1 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[8px] border bg-white min-h-0">
            <Outlet />
          </main>
          <AppDrawer />
        </div>
      </div>
    </>
  )
}

export default Layout
