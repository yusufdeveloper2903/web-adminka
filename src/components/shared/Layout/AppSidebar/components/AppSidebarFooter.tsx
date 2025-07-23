import { useState } from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { User, Moon, Sun, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import LogoutDialog from "./LogoutDialog"

type FooterProps = {
  isOpen: boolean
}

const FooterButton = ({ isOpen, tooltipText, children, ...props }: any) => {
  const button = <SidebarMenuButton {...props}>{children}</SidebarMenuButton>

  if (isOpen) {
    return button
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const AppSidebarFooter = ({ isOpen }: FooterProps) => {
  const { setTheme, theme } = useTheme()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  return (
    <>
      <SidebarMenu className="space-y-2">
        {/* Account Button */}
        <SidebarMenuItem>
          <FooterButton
            isOpen={isOpen}
            tooltipText="Profile"
            className={cn("h-10 !bg-white !text-black hover:!bg-gray-100", !isOpen && "justify-center")}
          >
            <User className="h-4 w-4" />
            <span className={cn("font-medium transition-opacity", !isOpen && "hidden")}>Walter White</span>
          </FooterButton>
        </SidebarMenuItem>

        {/* Action Buttons Row */}
        <SidebarMenuItem>
          <div className={cn("flex w-2/5 gap-2", !isOpen && "flex-col")}>
            <FooterButton
              isOpen={isOpen}
              tooltipText={theme === "light" ? "Switch to Dark" : "Switch to Light"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={cn(
                "flex cursor-pointer items-center justify-center !bg-transparent text-white hover:!bg-slate-600",
                !isOpen && "justify-center"
              )}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </FooterButton>

            <FooterButton
              isOpen={isOpen}
              tooltipText="Log Out"
              onClick={() => setShowLogoutDialog(true)}
              className={cn(
                "flex cursor-pointer items-center justify-center !bg-transparent text-white hover:!bg-slate-600",
                !isOpen && "justify-center"
              )}
            >
              <LogOut className="h-4 w-4" />
            </FooterButton>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  )
}

export default AppSidebarFooter
