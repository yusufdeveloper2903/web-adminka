import type { IBaseFiltersRequest, IPaginatedResponse } from "@/types"

// Default pagination size - global setting
export const DEFAULT_PAGE_SIZE = 20

// Generic function to get next page parameter for infinite queries
export const getNextPageParam = <T>(lastPage: IPaginatedResponse<T>, allPages: IPaginatedResponse<T>[]): number | undefined => {
  const currentPage = allPages.length - 1  // Vue kodidagi kabi allPages.length ishlatamiz
  
  if (currentPage < lastPage.totalPages - 1) {
    return currentPage + 1
  }
  return undefined
}

// Generic function to build pagination parameters with flexible size options
export const buildPaginationParams = (
  filters: IBaseFiltersRequest,
  pageParam: number,
  options?: {
    defaultSize?: number
    maxSize?: number
  }
) => {
  const { defaultSize = DEFAULT_PAGE_SIZE, maxSize = 100 } = options || {}

  // Use filter size if provided, otherwise use default, but cap at maxSize
  const size = Math.min(filters.size || defaultSize, maxSize)

  return {
    ...filters,
    page: pageParam,
    size
  }
}

// Helper function to create infinite query hook with custom page size
export const createInfiniteQueryHook = <TFilters extends IBaseFiltersRequest, TData>(
  queryKey: string,
  fetchFn: (filters: TFilters, pageParam: number) => Promise<IPaginatedResponse<TData>>,
  defaultPageSize?: number
) => {
  return (filters: TFilters = {} as TFilters) => {
    return {
      queryKey: [queryKey, filters],
      queryFn: ({ pageParam = 0 }) => fetchFn(filters, pageParam),
      getNextPageParam: getNextPageParam<TData>,
      initialPageParam: 0,
      // Allow custom page size per hook
      ...(defaultPageSize && {
        meta: { defaultPageSize }
      })
    }
  }
}
