import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, IUpdateTripRequest, ITripResponse } from "@/types"

const updateTrip = async (id: number, data: IUpdateTripRequest): Promise<ITripResponse> => {
  const response = await api.put<IApiResponse<ITripResponse>>(`/trips/${id}`, data)
  return response.data.data
}

export const useUpdateTripMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateTripRequest }) => updateTrip(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and update specific trip query
      queryClient.invalidateQueries({ queryKey: ["trip", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["trip-info", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["trips"] })

      // Show success toast
      toast.success("Trip updated successfully!")
    },
    onError: (error: any) => {
      console.error("Update trip failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid trip data. Please check your input and try again."
        } else if (status === 404) {
          errorMessage = error?.response?.data?.message || "Trip not found."
        } else if (status === 409) {
          errorMessage = error?.response?.data?.message || "Trip with this load number already exists."
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
