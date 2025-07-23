import { useAuthStore } from "@/store"
import { toast } from "sonner"

export const useLogout = () => {
  const { logout } = useAuthStore()

  const handleLogout = () => {
    try {
      logout()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error during logout")
    }
  }

  return handleLogout
}