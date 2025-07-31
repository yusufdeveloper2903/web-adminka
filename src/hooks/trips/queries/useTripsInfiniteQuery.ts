import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, ITripsFiltersRequest, ITripsResponse } from "@/types"

const fetchTrips = async (filters: ITripsFiltersRequest, pageParam: number): Promise<ITripsResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<ITripsResponse>>("/trips", { params })
  return response.data.data
}

export const useTripsInfiniteQuery = (filters: ITripsFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["trips", filters],
    queryFn: ({ pageParam = 0 }) => fetchTrips(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0,
    placeholderData: keepPreviousData
  })
}
