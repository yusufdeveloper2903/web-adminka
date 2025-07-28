import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, IDriversFiltersRequest, IDriversResponse } from "@/types"

const fetchDrivers = async (filters: IDriversFiltersRequest, pageParam: number): Promise<IDriversResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<IDriversResponse>>("/drivers", { params })
  return response.data.data
}

export const useDriversInfiniteQuery = (filters: IDriversFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["drivers", filters],
    queryFn: ({ pageParam = 0 }) => fetchDrivers(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}
