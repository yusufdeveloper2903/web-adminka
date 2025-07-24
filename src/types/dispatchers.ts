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

// Base Dispatcher Data (common fields for create/update)
export interface IDispatcherData {
  firstName: string
  lastName: string
  teamId: number
}

// Create Dispatcher Request (POST /api/v1/dispatchers)
export type ICreateDispatcherRequest = IDispatcherData

// Update Dispatcher Request (PUT /api/v1/dispatchers/{id})
export type IUpdateDispatcherRequest = IDispatcherData
