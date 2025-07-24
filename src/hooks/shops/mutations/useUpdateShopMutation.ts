import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateShopRequest, IShopResponse } from "@/types"

const updateShop = async (id: number, data: IUpdateShopRequest): Promise<IShopResponse> => {
  const response = await api.put<IApiResponse<IShopResponse>>(`/shops/${id}`, data)
  return response.data.data
}

export const useUpdateShopMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateShopRequest }) => updateShop(id, data),
      "shop",
      "update",
      (data, variables) => {
        // Invalidate and update specific shop query
        queryClient.invalidateQueries({ queryKey: ["shop", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["shops"] })
      }
    )
  )
}
