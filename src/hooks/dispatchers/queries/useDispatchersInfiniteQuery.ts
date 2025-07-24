import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, IDispatchersFiltersRequest, IDispatchersResponse } from "@/types"

const fetchDispatchers = async (
  filters: IDispatchersFiltersRequest,
  pageParam: number
): Promise<IDispatchersResponse> => {
  const params = {
    ...filters,
    page: pageParam,
    size: filters.size || 20
  }

  const response = await api.get<IApiResponse<IDispatchersResponse>>("/dispatchers", { params })
  return response.data.data
}

export const useDispatchersInfiniteQuery = (filters: IDispatchersFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["dispatchers", filters],
    queryFn: ({ pageParam = 0 }) => fetchDispatchers(filters, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1
      }
      return undefined
    },
    initialPageParam: 0
  })
}
