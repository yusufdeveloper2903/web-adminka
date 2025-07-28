import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, ITrucksFiltersRequest, ITrucksResponse } from "@/types"

const fetchDrivers = async (filters: ITrucksFiltersRequest, pageParam: number): Promise<ITrucksResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<ITrucksResponse>>("/drivers", { params })
  return response.data.data
}

export const useDriversInfiniteQuery = (filters: ITrucksFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["drivers", filters],
    queryFn: ({ pageParam = 0 }) => fetchDrivers(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}
