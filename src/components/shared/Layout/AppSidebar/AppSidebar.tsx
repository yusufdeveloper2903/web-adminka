import { useLocation } from "@tanstack/react-router"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Car,
  Route as RouteIcon,
  BarChart3,
  Monitor,
  Store,
  Truck,
  User,
  Users,
  UserCheck,
  Building2
} from "lucide-react"
import { useSidebarStore } from "@/store/sidebar-store"
import { cn } from "@/lib/utils"
import { AppSidebarFooter, AppSidebarNav } from "./components"

const menuItems = {
  general: [
    {
      title: "Trips",
      url: "/trips",
      icon: Car
    },
    {
      title: "Routes",
      url: "/routes",
      icon: RouteIcon
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3
    },
    {
      title: "Trucks",
      url: "/trucks",
      icon: Truck
    },
    {
      title: "Dispatchers",
      url: "/dispatchers",
      icon: UserCheck
    },
    {
      title: "Shops",
      url: "/shops",
      icon: Store
    },
    {
      title: "Companies",
      url: "/companies",
      icon: Building2
    }
  ],
  settings: [
    {
      title: "System",
      url: "/system",
      icon: Monitor
    },
    {
      title: "Users",
      url: "/users",
      icon: Users
    }
  ]
}

const AppSidebar = () => {
  const location = useLocation()
  const { isOpen } = useSidebarStore()

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-slate-700 !bg-[#0E416C]",
        "[&[data-state=expanded]>[data-slot=sidebar-gap]]:w-[var(--sidebar-width)]",
        "[&[data-state=collapsed]>[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]",
        "[&[data-state=expanded]>[data-slot=sidebar-container]]:w-[var(--sidebar-width)]",
        "[&[data-state=collapsed]>[data-slot=sidebar-container]]:w-[var(--sidebar-width-icon)]"
      )}
    >
      {/* Header */}
      <SidebarHeader className="border-b border-slate-700 p-0">
        <div
          className={cn(
            "flex items-center px-4 py-3 transition-all duration-200",
            !isOpen ? "justify-center" : "justify-between"
          )}
        >
          <div className={cn("relative h-5 w-24", !isOpen && "hidden")}>
            <span className="absolute top-0 left-0 text-lg font-bold whitespace-nowrap text-white">GL MILER</span>
          </div>
          <SidebarTrigger className="h-6 w-6 !bg-transparent text-white hover:!bg-slate-600 hover:text-white" />
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className={cn("py-4", isOpen ? "px-3" : "px-1")}>
        <AppSidebarNav title="General" items={menuItems.general} isOpen={isOpen} location={location} />
        <AppSidebarNav title="Settings" items={menuItems.settings} isOpen={isOpen} location={location} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-700 p-3">
        <AppSidebarFooter isOpen={isOpen} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
