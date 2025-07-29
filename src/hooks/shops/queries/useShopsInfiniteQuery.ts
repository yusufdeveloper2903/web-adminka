import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, IShopsFiltersRequest, IShopsResponse } from "@/types"

const fetchShops = async (filters: IShopsFiltersRequest, pageParam: number): Promise<IShopsResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<IShopsResponse>>("/shops", { params })
  return response.data.data
}

export const useShopsInfiniteQuery = (filters: IShopsFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["shops", filters],
    queryFn: ({ pageParam = 0 }) => fetchShops(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}