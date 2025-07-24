import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripsFiltersRequest, ITripsResponse } from "@/types"

const fetchTrips = async (filters: ITripsFiltersRequest, pageParam: number): Promise<ITripsResponse> => {
  const params = {
    ...filters,
    page: pageParam,
    size: filters.size || 20
  }

  const response = await api.get<IApiResponse<ITripsResponse>>("/trips", { params })
  return response.data.data
}

export const useTripsInfiniteQuery = (filters: ITripsFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["trips", filters],
    queryFn: ({ pageParam = 0 }) => fetchTrips(filters, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1
      }
      return undefined
    },
    initialPageParam: 0
  })
}
