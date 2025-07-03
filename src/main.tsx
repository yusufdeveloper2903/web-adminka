import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import "./index.css"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"
import { queryClient } from "@/constants"
import { QueryClientProvider } from "@tanstack/react-query"
import { SidebarProvider } from "./components/ui"

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <RouterProvider router={router} />
        </SidebarProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
