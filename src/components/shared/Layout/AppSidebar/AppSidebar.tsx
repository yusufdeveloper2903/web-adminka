import { useLocation } from "@tanstack/react-router"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar"
import { Users } from "lucide-react"
import { useSidebarStore } from "@/store/sidebar-store"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { AppSidebarFooter, AppSidebarNav } from "./components"

const menuItems = {
  settings: [
    {
      title: "Staffs",
      url: "/staffs",
      icon: Users
    }
  ]
}

const AppSidebar = () => {
  const location = useLocation()
  const { isOpen } = useSidebarStore()

  // Dispatch custom event when sidebar state changes
  useEffect(() => {
    const event = new CustomEvent("sidebar-toggle", { detail: { isOpen } })
    window.dispatchEvent(event)
  }, [isOpen])

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "rounded-[8px] border-r border-slate-700 !bg-[#0E416C]",
        "[&[data-state=expanded]>[data-slot=sidebar-gap]]:w-[var(--sidebar-width)]",
        "[&[data-state=collapsed]>[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]",
        "[&[data-state=expanded]>[data-slot=sidebar-container]]:w-[var(--sidebar-width)]",
        "[&[data-state=collapsed]>[data-slot=sidebar-container]]:w-[var(--sidebar-width-icon)]"
      )}
    >
      {/* Header */}
      <SidebarHeader className="h-16 border-b border-slate-700 p-0">
        <div
          className={cn(
            "flex items-center px-4 py-3 transition-all duration-200",
            !isOpen ? "justify-center" : "justify-between"
          )}
        >
          <div className={cn("relative h-[25px] w-24", !isOpen && "hidden")}>
            <span className="absolute top-0 left-0 text-lg font-bold whitespace-nowrap text-white">Web Adminka</span>
          </div>
          <SidebarTrigger className="h-[42px] w-[42px] !bg-transparent text-white hover:!bg-slate-600 hover:text-white" />
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className={cn("py-4", isOpen ? "px-3" : "px-1")}>
        <AppSidebarNav items={menuItems.settings} isOpen={isOpen} location={location} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-700 p-3">
        <AppSidebarFooter isOpen={isOpen} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
