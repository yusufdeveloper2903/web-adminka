import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeStatusRequest, IChangeStatusResponse } from "@/types"

const changeDispatcherStatus = async ({ id, active }: IChangeStatusRequest): Promise<IChangeStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeStatusResponse>>(`/dispatchers/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeDispatcherStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      changeDispatcherStatus,
      'dispatcher',
      'status',
      (data, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["dispatcher", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["dispatchers"] })
      }
    )
  )
}
