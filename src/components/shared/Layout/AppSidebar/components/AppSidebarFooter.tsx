import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, Moon, Sun, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

type FooterProps = {
  isOpen: boolean
}

const AppSidebarFooter = ({ isOpen }: FooterProps) => {
  const { setTheme, theme } = useTheme()

  return (
    <SidebarMenu className="space-y-2">
      {/* Account Button */}
      <SidebarMenuItem className="flex w-full justify-center">
        <SidebarMenuButton className={cn("h-10 !bg-white !text-black hover:!bg-gray-100", !isOpen && "justify-center")}>
          <User className="h-4 w-4" />
          <span className={cn("font-medium transition-opacity", !isOpen && "hidden")}>Walter White</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Action Buttons Row */}
      <SidebarMenuItem className="flex justify-center">
        <div className={cn("flex gap-2", !isOpen && "flex-col")}>
          <SidebarMenuButton
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={cn("!bg-transparent text-white hover:!bg-slate-600", !isOpen && "justify-center")}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </SidebarMenuButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className={cn("!bg-transparent text-white hover:!bg-slate-600", !isOpen && "justify-center")}
              >
                <LogOut className="h-4 w-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default AppSidebarFooter
