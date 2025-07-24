import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, ILoadNumbersFiltersRequest, ILoadNumbersResponse } from "@/types"

const fetchLoadNumbers = async (
  filters: ILoadNumbersFiltersRequest,
  pageParam: number
): Promise<ILoadNumbersResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<ILoadNumbersResponse>>("/trips/load-numbers", { params })
  return response.data.data
}

export const useLoadNumbersQuery = (filters: ILoadNumbersFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["load-numbers", filters],
    queryFn: ({ pageParam = 0 }) => fetchLoadNumbers(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}
