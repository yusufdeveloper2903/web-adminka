import { Link, useLocation } from "@tanstack/react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar"
import {
  Car,
  Route as RouteIcon,
  BarChart3,
  Settings,
  Monitor,
  Building,
  Truck,
  User,
  Users,
  Moon,
  LogOut
} from "lucide-react"

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
    }
  ],
  settings: [
    {
      title: "System",
      url: "/system",
      icon: Monitor
    },
    {
      title: "Companies",
      url: "/companies",
      icon: Building
    },
    {
      title: "Trucks",
      url: "/trucks",
      icon: Truck
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User
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

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-700 bg-[#0A2540]">
      {/* Header with GL MILER and toggle button */}
      <SidebarHeader className="border-b border-slate-700 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-white">GL MILER</span>
          <SidebarTrigger className="h-6 w-6 text-white hover:bg-slate-600 hover:text-white" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* General Section */}
        <SidebarGroup className="mb-6">
          <SidebarGroupLabel className="mb-2 px-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.general.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-gray-300 hover:bg-sky-700 hover:text-white data-[active=true]:bg-sky-700 data-[active=true]:text-white"
                  >
                    <Link to={item.url} search={{}}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-gray-300 hover:bg-sky-700 hover:text-white data-[active=true]:bg-sky-700 data-[active=true]:text-white"
                  >
                    <Link to={item.url} search={{}}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with account and action buttons */}
      <SidebarFooter className="border-t border-slate-700 p-3">
        <SidebarMenu className="space-y-2">
          {/* Account Button */}
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10 bg-white text-black hover:bg-gray-100">
              <User className="h-4 w-4" />
              <span className="font-medium">Walter White</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Action Buttons Row */}
          <SidebarMenuItem>
            <div className="flex gap-2">
              <SidebarMenuButton className="flex-1 text-white hover:bg-slate-600">
                <Moon className="h-4 w-4" />
              </SidebarMenuButton>
              <SidebarMenuButton className="flex-1 text-white hover:bg-slate-600">
                <LogOut className="h-4 w-4" />
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
