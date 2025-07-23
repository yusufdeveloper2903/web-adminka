import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse } from "@/types"

interface IResetPasswordInitRequest {
  email: string
}

interface IResetPasswordInitResponse {
  message: string
}

const resetPasswordInit = async (
  data: IResetPasswordInitRequest
): Promise<IApiResponse<IResetPasswordInitResponse>> => {
  const response = await api.post("/reset-password/init", null, {
    params: { email: data.email }
  })
  return response.data
}

const useResetPasswordInitMutation = () => {
  return useMutation({
    mutationFn: resetPasswordInit,
    onSuccess: (data) => {
      // Show success toast
      toast.success("Password reset link has been sent to your email address.")
    },
    onError: (error: any) => {
      console.error("Reset password init failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // For reset password, provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 404) {
          errorMessage = error?.response?.data?.message || "Email address not found. Please check and try again."
        } else if (status === 429) {
          errorMessage = error?.response?.data?.message || "Too many requests. Please wait a moment and try again."
        } else if (status === 500) {
          errorMessage = error?.response?.data?.message || "Server error. Please try again later."
        } else {
          errorMessage = error?.response?.data?.message || getStatusErrorMessage(status)
        }
      }

      // Show error toast
      toast.error(errorMessage)
    }
  })
}

export default useResetPasswordInitMutation
