import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeTripStatusRequest, IChangeTripStatusResponse } from "@/types"

// PATCH /api/v1/trips/change-trip-status/{id}?tripStatus=...
const changeTripStatus = async ({ id, tripStatus }: IChangeTripStatusRequest): Promise<IChangeTripStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeTripStatusResponse>>(`/trips/change-trip-status/${id}`, null, {
    params: { tripStatus }
  })
  return response.data.data
}

export const useChangeTripStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(changeTripStatus,  "trip", "status", (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["trip-info", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["trips"] })
    }, { statusDefaultActive: false })
  )
}
