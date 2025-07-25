import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateTripRequest, ITripDetailResponse } from "@/types"

const updateTrip = async (id: number, data: IUpdateTripRequest): Promise<ITripDetailResponse> => {
  const response = await api.put<IApiResponse<ITripDetailResponse>>(`/trips/${id}`, data)
  return response.data.data
}

export const useUpdateTripMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateTripRequest }) => updateTrip(id, data),
      "trip",
      "update",
      (data, variables) => {
        // Invalidate and update specific trip query
        queryClient.invalidateQueries({ queryKey: ["trip", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["trip-info", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["trips"] })
      }
    )
  )
}
