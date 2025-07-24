import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { handleMutationError } from "@/lib/mutation-utils"
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
      // Use generic error handler but with custom messages for auth
      let errorMessage = error?.response?.data?.message

      if (!errorMessage && error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = "Invalid or expired reset token. Please request a new password reset."
        } else if (status === 422) {
          errorMessage = "Passwords do not match or do not meet requirements."
        }
      }

      if (errorMessage) {
        toast.error(errorMessage)
      } else {
        // Fallback to generic error handling
        handleMutationError(error, "dispatcher", "create") // Using dispatcher as fallback
      }
    }
  })
}

export default useResetPasswordFinishMutation
