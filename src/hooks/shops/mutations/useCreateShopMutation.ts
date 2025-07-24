import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, ICreateShopRequest, IShopResponse } from "@/types"

const createShop = async (data: ICreateShopRequest): Promise<IShopResponse> => {
  const response = await api.post<IApiResponse<IShopResponse>>("/shops", data)
  return response.data.data
}

export const useCreateShopMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createShop,
    onSuccess: (data) => {
      // Invalidate shops queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["shops"] })

      // Show success toast
      toast.success("Shop created successfully!")
    },
    onError: (error: any) => {
      console.error("Create shop failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid shop data. Please check your input and try again."
        } else if (status === 409) {
          errorMessage = error?.response?.data?.message || "Shop with this name and location already exists."
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
