import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeStatusRequest, IChangeStatusResponse } from "@/types"

const changeShopStatus = async ({ id, active }: IChangeStatusRequest): Promise<IChangeStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeStatusResponse>>(`/shops/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeShopStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(changeShopStatus, "shop", "status", (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["shop", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    })
  )
}
