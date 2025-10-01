import { useEffect, useState } from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { User, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// Removed LogoutDialog and logout button

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
  const [displayName, setDisplayName] = useState<string>("")

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user_data") : null
      if (raw) {
        const u = JSON.parse(raw)
        const first = u?.first_name ?? u?.firstName ?? ""
        const last = u?.sur_name ?? u?.lastName ?? ""
        const composed = `${first} ${last}`.trim()
        const fallback = u?.username || u?.email || "User"
        setDisplayName(composed || fallback)
      } else {
        setDisplayName("User")
      }
    } catch {
      setDisplayName("User")
    }
  }, [])

  return (
    <>
      <SidebarMenu className="space-y-2">
        {/* Account Button */}
        <SidebarMenuItem>
          <FooterButton
            isOpen={isOpen}
            tooltipText={displayName}
            className={cn(
              "relative h-10 cursor-pointer !bg-white !text-black hover:!bg-gray-100 pr-10",
              !isOpen && "justify-center pr-0"
            )}
          >
            <User className="h-5 w-5" />
            <span className={cn("font-medium transition-opacity", !isOpen && "hidden")}>{displayName}</span>

            {isOpen && (
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label={theme === "light" ? "Switch to Dark" : "Switch to Light"}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-gray-200"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}
          </FooterButton>
        </SidebarMenuItem>

        {/* Theme toggle moved into profile card */}
      </SidebarMenu>

      {/* Logout removed */}
    </>
  )
}

export default AppSidebarFooter
