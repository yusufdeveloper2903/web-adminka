import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

// Dispatcher API Request/Response interfaces with I prefix

// GET /api/v1/dispatchers filters
export interface IDispatchersFiltersRequest extends IBaseFiltersRequest {
  teamId?: number
}

// Dispatcher Response
export interface IDispatcherResponse {
  id: number
  firstName: string
  lastName: string
  teamId: number
  active: boolean
  createdAt: string
  updatedAt: string
}

// Dispatchers List Response (paginated)
export type IDispatchersResponse = IPaginatedResponse<IDispatcherResponse>

// Create Dispatcher Request (POST /api/v1/dispatchers)
export interface ICreateDispatcherRequest {
  firstName: string
  lastName: string
  teamId: number
}

// Update Dispatcher Request (PUT /api/v1/dispatchers/{id})
export interface IUpdateDispatcherRequest {
  firstName: string
  lastName: string
  teamId: number
}
