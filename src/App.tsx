import { queryClient } from "@/constants"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { StrictMode } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "@/routes/router"
import "./index.css"
import { Toaster } from "./components/ui/sonner"

const App = () => {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
        <Toaster position="top-right" closeButton richColors />
      </ThemeProvider>
    </StrictMode>
  )
}

export default App
