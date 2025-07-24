import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITrucksFiltersRequest, ITrucksResponse } from "@/types"

const fetchTrucks = async (filters: ITrucksFiltersRequest, pageParam: number): Promise<ITrucksResponse> => {
  const params = {
    ...filters,
    page: pageParam,
    size: filters.size || 20
  }

  const response = await api.get<IApiResponse<ITrucksResponse>>("/trucks", { params })
  return response.data.data
}

export const useTrucksInfiniteQuery = (filters: ITrucksFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["trucks", filters],
    queryFn: ({ pageParam = 0 }) => fetchTrucks(filters, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1
      }
      return undefined
    },
    initialPageParam: 0
  })
}
