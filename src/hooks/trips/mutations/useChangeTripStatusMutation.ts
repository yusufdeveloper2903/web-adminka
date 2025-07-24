import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeStatusRequest, IChangeStatusResponse } from "@/types"

const changeStatus = async ({ id, active }: IChangeStatusRequest): Promise<IChangeStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeStatusResponse>>(`/trips/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeTripStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      changeStatus,
      'trip',
      'status',
      (data, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["trip", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["trip-info", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["trips"] })
      }
    )
  )
}
