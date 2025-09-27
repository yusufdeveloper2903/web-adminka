import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { buildPaginationParams, getNextPageParam } from "@/lib/query-utils"
import type { IPaginatedResponse, IBaseFiltersRequest } from "@/types/api"
import type { IStaffResponse } from "@/types/staffs"

interface DRFListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

const fetchStaffs = async (
  filters: IBaseFiltersRequest,
  pageParam: number
): Promise<IPaginatedResponse<IStaffResponse>> => {
  const base = buildPaginationParams(filters, pageParam)

  const params = {
    search: base.keyword || undefined,
    page: (base.page ?? 0) + 1,
    page_size: base.size
  }

  const response = await api.get<DRFListResponse<IStaffResponse>>("api/v1/staffs/staffs/", { params })
  const data = response.data

  return {
    content: data.results || [],
    totalElements: data.count || 0,
    totalPages: Math.max(1, Math.ceil((data.count || 0) / (base.size || 1))),
    size: base.size,
    number: base.page ?? 0
  }
}

export const useStaffsInfiniteQuery = (filters: IBaseFiltersRequest = {}) => {
  return useInfiniteQuery({
    queryKey: ["staffs", filters],
    queryFn: ({ pageParam = 0 }) => fetchStaffs(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}


