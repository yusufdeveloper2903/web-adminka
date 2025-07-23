import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/store"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, IAuthenticateRequest, IAuthenticateResponse } from "@/types"

const authenticateUser = async (credentials: IAuthenticateRequest): Promise<IApiResponse<IAuthenticateResponse>> => {
  const response = await api.post("/authenticate", credentials)
  return response.data
}

const useAuthenticateMutation = () => {
  const { login, logout } = useAuthStore()

  return useMutation({
    mutationFn: authenticateUser,
    onSuccess: (data) => {
      // Save tokens to localStorage
      const { accessToken, refreshToken } = data.data
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)

      // Update auth store - for now we'll create a basic user object
      // Later you can fetch user details from a separate endpoint
      const user = {
        id: 1, // This should come from token or separate API call
        email: "", // This should come from token or separate API call
        firstName: "",
        lastName: "",
        role: "",
        createdAt: "",
        updatedAt: ""
      }
      login(user)

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
          errorMessage = "Invalid email or password. Please try again."
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
