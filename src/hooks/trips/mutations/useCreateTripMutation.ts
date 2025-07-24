import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, ICreateTripRequest, ITripResponse } from "@/types"

const createTrip = async (data: ICreateTripRequest): Promise<ITripResponse> => {
  const response = await api.post<IApiResponse<ITripResponse>>("/trips", data)
  return response.data.data
}

export const useCreateTripMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTrip,
    onSuccess: (data) => {
      // Invalidate trips queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["trips"] })
      queryClient.invalidateQueries({ queryKey: ["load-numbers"] })

      // Show success toast
      toast.success("Trip created successfully!")
    },
    onError: (error: any) => {
      console.error("Create trip failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid trip data. Please check your input and try again."
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
