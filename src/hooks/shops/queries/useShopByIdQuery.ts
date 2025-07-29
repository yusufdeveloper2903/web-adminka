import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, IShopResponse } from "@/types"

const fetchShop = async (id: number): Promise<IShopResponse> => {
  const response = await api.get<IApiResponse<IShopResponse>>(`/shops/${id}`)
  return response.data.data
}

export const useShopByIdQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["shop", id],
    queryFn: () => fetchShop(id),
    enabled: enabled && !!id
  })
}
