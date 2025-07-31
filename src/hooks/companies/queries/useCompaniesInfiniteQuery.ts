import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IApiResponse, ICompaniesFiltersRequest, ICompaniesResponse } from "@/types"

const fetchCompanies = async (filters: ICompaniesFiltersRequest, pageParam: number): Promise<ICompaniesResponse> => {
  const params = buildPaginationParams(filters, pageParam)
  const response = await api.get<IApiResponse<ICompaniesResponse>>("/companies", { params })
  return response.data.data
}

export const useCompaniesInfiniteQuery = (filters: ICompaniesFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["companies", filters],
    queryFn: ({ pageParam = 0 }) => fetchCompanies(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0,
    placeholderData: keepPreviousData
  })
}
