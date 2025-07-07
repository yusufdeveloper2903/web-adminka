import { Link } from "@tanstack/react-router"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type MenuItem = {
  title: string
  url: string
  icon: React.ElementType
}

type NavMenuProps = {
  title: string
  items: MenuItem[]
  isOpen: boolean
  location: {
    pathname: string
  }
}

const AppSidebarNav = ({ title, items, isOpen, location }: NavMenuProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-2 px-2 text-xs font-semibold tracking-wider text-white uppercase">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) =>
            isOpen ? (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className={cn("w-full text-white", !isOpen && "justify-center px-2")}
                >
                  <Link
                    to={item.url}
                    search={{}}
                    className="!text-[#A9BCD1] transition-all duration-200 hover:!text-white"
                    activeProps={{ className: "!text-white" }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className={cn("transition-opacity", !isOpen && "hidden")}>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <TooltipProvider key={item.title} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className={cn("justify-center px-2 text-white")}
                      >
                        <Link
                          to={item.url}
                          search={{}}
                          className="!text-[#A9BCD1] transition-all duration-200 hover:!text-white"
                          activeProps={{ className: "!text-white" }}
                        >
                          <item.icon className="h-4 w-4" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default AppSidebarNav
