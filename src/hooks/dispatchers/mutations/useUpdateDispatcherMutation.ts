import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, IUpdateDispatcherRequest, IDispatcherResponse } from "@/types"

const updateDispatcher = async (id: number, data: IUpdateDispatcherRequest): Promise<IDispatcherResponse> => {
  const response = await api.put<IApiResponse<IDispatcherResponse>>(`/dispatchers/${id}`, data)
  return response.data.data
}

export const useUpdateDispatcherMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateDispatcherRequest }) => updateDispatcher(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and update specific dispatcher query
      queryClient.invalidateQueries({ queryKey: ["dispatcher", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["dispatchers"] })

      // Show success toast
      toast.success("Dispatcher updated successfully!")
    },
    onError: (error: any) => {
      console.error("Update dispatcher failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage =
            error?.response?.data?.message || "Invalid dispatcher data. Please check your input and try again."
        } else if (status === 404) {
          errorMessage = error?.response?.data?.message || "Dispatcher not found."
        } else if (status === 409) {
          errorMessage = error?.response?.data?.message || "Dispatcher with this name already exists."
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
