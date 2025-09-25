import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse } from "@/types/api"
import type { IIdentifierNumbersRequest, IIdentifierNumbersResponse } from "@/types"

const fetchIdentifierNumbers = async (
  filters: IIdentifierNumbersRequest,
  pageParam: number
): Promise<IIdentifierNumbersResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<IIdentifierNumbersResponse>>("/trips/identifier-numbers", { params })
  return response.data.data
}

export const useTripIdentifierNumbersQuery = (filters: IIdentifierNumbersRequest) => {
  return useInfiniteQuery({
    queryKey: ["identifier-numbers", filters],
    queryFn: ({ pageParam = 0 }) => fetchIdentifierNumbers(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}
