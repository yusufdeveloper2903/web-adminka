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
  SidebarHeader
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ChevronUp,
  Moon,
  RotateCcw
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
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">GL</div>
          <span className="text-lg font-bold">GL MILER</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4" />
            GENERAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.general.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SETTINGS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatars/walter-white.jpg" alt="Walter White" />
                    <AvatarFallback className="rounded-lg">WW</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Walter White</span>
                    <span className="truncate text-xs">walter@example.com</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
