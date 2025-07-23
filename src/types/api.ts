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