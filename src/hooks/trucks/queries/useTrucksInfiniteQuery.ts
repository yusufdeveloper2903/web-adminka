import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, ITrucksFiltersRequest, ITrucksResponse } from "@/types"

const fetchTrucks = async (filters: ITrucksFiltersRequest, pageParam: number): Promise<ITrucksResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<ITrucksResponse>>("/trucks", { params })
  return response.data.data
}

export const useTrucksInfiniteQuery = (filters: ITrucksFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["trucks", filters],
    queryFn: ({ pageParam = 0 }) => fetchTrucks(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}
