import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateTripRequest, ITripResponse } from "@/types"

const createTrip = async (data: ICreateTripRequest): Promise<ITripResponse> => {
  const response = await api.post<IApiResponse<ITripResponse>>("/trips", data)
  return response.data.data
}

export const useCreateTripMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createTrip, "trip", "create", () => {
      // Invalidate trips queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["trips"] })
      queryClient.invalidateQueries({ queryKey: ["load-numbers"] })
    })
  )
}
