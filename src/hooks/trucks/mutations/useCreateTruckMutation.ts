import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, ICreateTruckRequest, ITruckResponse } from "@/types"

const createTruck = async (data: ICreateTruckRequest): Promise<ITruckResponse> => {
  const response = await api.post<IApiResponse<ITruckResponse>>("/trucks", data)
  return response.data.data
}

export const useCreateTruckMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTruck,
    onSuccess: (data) => {
      // Invalidate trucks queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["trucks"] })

      // Show success toast
      toast.success("Truck created successfully!")
    },
    onError: (error: any) => {
      console.error("Create truck failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid truck data. Please check your input and try again."
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
