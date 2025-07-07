import { Link } from "@tanstack/react-router"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar"
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
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="flex justify-center">
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                className={cn("text-white", !isOpen && "justify-center px-2")}
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
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default AppSidebarNav
