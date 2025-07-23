import { queryClient } from "@/constants"
import { QueryClientProvider } from "@tanstack/react-query"
import { SidebarProvider } from "./components/ui"
import { ThemeProvider } from "next-themes"
import { useSidebarStore } from "./store/sidebar-store"
import { useAuthInit } from "@/hooks"
import { StrictMode } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "@/routes/router"
import "./index.css"
import { Toaster } from "./components/ui/sonner"

const App = () => {
  const { isOpen, toggleSidebar } = useSidebarStore()

  // Initialize authentication state
  useAuthInit()

  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <SidebarProvider open={isOpen} onOpenChange={toggleSidebar}>
            <RouterProvider router={router} />
          </SidebarProvider>
        </QueryClientProvider>
        <Toaster position="top-right" closeButton richColors />
      </ThemeProvider>
    </StrictMode>
  )
}

export default App
