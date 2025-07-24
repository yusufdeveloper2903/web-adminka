import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ILoadNumbersFiltersRequest, ILoadNumbersResponse } from "@/types"

const fetchLoadNumbers = async (
  filters: ILoadNumbersFiltersRequest,
  pageParam: number
): Promise<ILoadNumbersResponse> => {
  const params = {
    ...filters,
    page: pageParam,
    size: filters.size || 20
  }

  const response = await api.get<IApiResponse<ILoadNumbersResponse>>("/trips/load-numbers", { params })
  return response.data.data
}

export const useLoadNumbersQuery = (filters: ILoadNumbersFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["load-numbers", filters],
    queryFn: ({ pageParam = 0 }) => fetchLoadNumbers(filters, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1
      }
      return undefined
    },
    initialPageParam: 0
  })
}
