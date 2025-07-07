import ReactDOM from "react-dom/client"
import "./index.css"

// Import the router instance
import { router } from "@/routes/router"
import App from "./App"

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}
