import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, IDispatchersFiltersRequest, IDispatchersResponse } from "@/types"

const fetchDispatchers = async (
  filters: IDispatchersFiltersRequest,
  pageParam: number
): Promise<IDispatchersResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<IDispatchersResponse>>("/dispatchers", { params })
  return response.data.data
}

export const useDispatchersInfiniteQuery = (filters: IDispatchersFiltersRequest = {}, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["dispatchers", filters],
    enabled,
    queryFn: ({ pageParam = 0 }) => fetchDispatchers(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0,
    placeholderData: keepPreviousData
  })
}
