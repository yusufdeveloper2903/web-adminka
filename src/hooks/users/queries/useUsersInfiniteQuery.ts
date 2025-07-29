import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, IUsersFiltersRequest, IUsersResponse } from "@/types"

const fetchUsers = async (filters: IUsersFiltersRequest, pageParam: number): Promise<IUsersResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<IUsersResponse>>("/users", { params })
  return response.data.data
}

export const useUsersInfiniteQuery = (filters: IUsersFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["users", filters],
    queryFn: ({ pageParam = 0 }) => fetchUsers(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}
