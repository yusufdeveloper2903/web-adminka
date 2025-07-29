import { useState } from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { User, Moon, Sun, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProfileDialog } from "./ProfileDialog"
import LogoutDialog from "./LogoutDialog"
import { useMeQuery } from "@/hooks/auth"

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
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  const { data: currentUserData } = useMeQuery()

  return (
    <>
      <SidebarMenu className="space-y-2">
        {/* Account Button */}
        <SidebarMenuItem>
          <FooterButton
            isOpen={isOpen}
            tooltipText={`${currentUserData?.firstName} ${currentUserData?.lastName}`}
            onClick={() => setShowProfileDialog(true)}
            className={cn("h-10 cursor-pointer !bg-white !text-black hover:!bg-gray-100", !isOpen && "justify-center")}
          >
            <User className="h-5 w-5" />
            <span className={cn("font-medium transition-opacity", !isOpen && "hidden")}>
              {`${currentUserData?.firstName} ${currentUserData?.lastName}`}
            </span>
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
      <ProfileDialog isOpen={showProfileDialog} onClose={() => setShowProfileDialog(false)} />
    </>
  )
}

export default AppSidebarFooter
