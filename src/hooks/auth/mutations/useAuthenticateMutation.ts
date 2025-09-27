import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/store"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, IAuthenticateRequest, IAuthenticateResponse } from "@/types"

const authenticateUser = async (credentials: IAuthenticateRequest): Promise<IApiResponse<IAuthenticateResponse>> => {
  const response = await api.post("api/v1/staffs/login/", credentials)
  return response.data
}

const useAuthenticateMutation = () => {
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: authenticateUser,
    onSuccess: (data) => {
      // Save tokens and user info to localStorage
      const payload: any = (data as any)?.data ?? (data as any)
      const accessToken = payload.accessToken ?? payload.access
      const refreshToken = payload.refreshToken ?? payload.refresh
      const userData = payload.user ?? payload.user_data

      if (accessToken) localStorage.setItem("access_token", accessToken)
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken)
      if (userData) localStorage.setItem("user_data", JSON.stringify(userData))

      // Update auth store - for now we'll create a basic user object
      // Later you can fetch user details from a separate endpoint
      // Optionally hydrate store from response if available
      const user = userData
        ? {
            id: userData.id ?? 0,
            email: userData.email ?? "",
            firstName: userData.first_name ?? userData.firstName ?? "",
            lastName: userData.sur_name ?? userData.lastName ?? "",
            phone: userData.phone ?? "",
            role: (userData.role as any) ?? ("" as any)
          }
        : (undefined as any)
      if (user) {
        login(user as any)
      }

      // Show success toast
      toast.success("Login successful! Welcome back.")
    },
    onError: (error: any) => {
      console.error("Authentication failed:", error)

      // Clear any existing tokens on error
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      // Update auth store without calling logout (which redirects)
      const { setUser } = useAuthStore.getState()
      setUser(null)

      // Get user-friendly error message
      let errorMessage = getErrorMessage(error)

      // For authentication, provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400 || status === 401) {
          errorMessage = "Invalid username or password. Please try again."
        } else {
          errorMessage = getStatusErrorMessage(status)
        }
      }

      // Show error toast
      toast.error(errorMessage)
    }
  })
}

export default useAuthenticateMutation
