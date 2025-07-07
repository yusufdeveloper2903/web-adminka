import { Layout } from "@/components/shared"
import { createRootRoute } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: () => <Layout />
})
