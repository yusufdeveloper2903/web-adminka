import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, ITeamsFiltersRequest, ITeamsResponse } from "@/types"

const fetchTeams = async (filters: ITeamsFiltersRequest, pageParam: number): Promise<ITeamsResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<ITeamsResponse>>("/teams", { params })
  return response.data.data
}

export const useTeamsInfiniteQuery = (filters: ITeamsFiltersRequest = {}, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["teams", filters],
    enabled,
    queryFn: ({ pageParam = 0 }) => fetchTeams(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}
