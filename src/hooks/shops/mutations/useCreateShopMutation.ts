import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateShopRequest, IShopResponse } from "@/types"

const createShop = async (data: ICreateShopRequest): Promise<IShopResponse> => {
  const response = await api.post<IApiResponse<IShopResponse>>("/shops", data)
  return response.data.data
}

export const useCreateShopMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createShop, "shop", "create", () => {
      // Invalidate shops queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    })
  )
}
