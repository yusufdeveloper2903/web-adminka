import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse } from "@/types"

interface IResetPasswordFinishRequest {
  email: string
  newPassword: string
  confirmPassword: string
  token: string
}

interface IResetPasswordFinishResponse {
  message: string
}

const resetPasswordFinish = async (
  data: IResetPasswordFinishRequest
): Promise<IApiResponse<IResetPasswordFinishResponse>> => {
  const response = await api.post("/reset-password/finish", data)
  return response.data
}

const useResetPasswordFinishMutation = () => {
  return useMutation({
    mutationFn: resetPasswordFinish,
    onSuccess: (data) => {
      // Show success toast
      toast.success("Password has been reset successfully. You can now sign in with your new password.")
    },
    onError: (error: any) => {
      console.error("Reset password finish failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // For reset password finish, provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage =
            error?.response?.data?.message || "Invalid or expired reset token. Please request a new password reset."
        } else if (status === 422) {
          errorMessage = error?.response?.data?.message || "Passwords do not match or do not meet requirements."
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

export default useResetPasswordFinishMutation
