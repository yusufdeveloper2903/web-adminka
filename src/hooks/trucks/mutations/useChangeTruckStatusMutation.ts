import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, IChangeTruckStatusRequest, IChangeTruckStatusResponse } from "@/types"

const changeTruckStatus = async ({ id, active }: IChangeTruckStatusRequest): Promise<IChangeTruckStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeTruckStatusResponse>>(`/trucks/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeTruckStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changeTruckStatus,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["truck", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["trucks"] })

      // Show success toast
      const statusText = data.active ? "activated" : "deactivated"
      toast.success(`Truck ${statusText} successfully!`)
    },
    onError: (error: any) => {
      console.error("Change truck status failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid status change request."
        } else if (status === 404) {
          errorMessage = error?.response?.data?.message || "Truck not found."
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
