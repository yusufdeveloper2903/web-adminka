import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { handleMutationError } from "@/lib/mutation-utils"
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
      // Use generic error handler but with custom messages for auth
      let errorMessage = error?.response?.data?.message

      if (!errorMessage && error?.response?.status) {
        const status = error.response.status
        if (status === 404) {
          errorMessage = "Email address not found. Please check and try again."
        } else if (status === 429) {
          errorMessage = "Too many requests. Please wait a moment and try again."
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

export default useResetPasswordInitMutation
