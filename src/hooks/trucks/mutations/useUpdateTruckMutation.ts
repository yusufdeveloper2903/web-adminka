import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, IUpdateTruckRequest, ITruckResponse } from "@/types"

const updateTruck = async (id: number, data: IUpdateTruckRequest): Promise<ITruckResponse> => {
  const response = await api.put<IApiResponse<ITruckResponse>>(`/trucks/${id}`, data)
  return response.data.data
}

export const useUpdateTruckMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateTruckRequest }) => updateTruck(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and update specific truck query
      queryClient.invalidateQueries({ queryKey: ["truck", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["trucks"] })

      // Show success toast
      toast.success("Truck updated successfully!")
    },
    onError: (error: any) => {
      console.error("Update truck failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid truck data. Please check your input and try again."
        } else if (status === 404) {
          errorMessage = error?.response?.data?.message || "Truck not found."
        } else if (status === 409) {
          errorMessage = error?.response?.data?.message || "Truck with this VIN or unit number already exists."
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
