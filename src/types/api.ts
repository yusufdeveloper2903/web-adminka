export interface IApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface IApiError {
  code: number
  message: string
  errors?: string[]
}

export interface IPaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  nextOffset?: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Common filter interface for all list requests
export interface IBaseFiltersRequest {
  id?: number
  keyword?: string
  active?: boolean
  page?: number
  size?: number
  sortName?: string
  sortDir?: string
}

// Common paginated response interface
export interface IPaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Common change status request interface
export interface IChangeStatusRequest {
  id: number
  active: boolean
}

// Common change status response interface
export interface IChangeStatusResponse {
  id: number
  active: boolean
  message: string
}
