import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeStatusRequest, IChangeStatusResponse } from "@/types"

const changeTruckStatus = async ({ id, active }: IChangeStatusRequest): Promise<IChangeStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeStatusResponse>>(`/trucks/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeTruckStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      changeTruckStatus,
      'truck',
      'status',
      (data, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["truck", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["trucks"] })
      }
    )
  )
}
