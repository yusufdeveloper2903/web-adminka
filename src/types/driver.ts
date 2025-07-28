import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

// Dispatcher API Request/Response interfaces with I prefix

// GET /api/v1/drivers filters
export interface IDriversFiltersRequest extends IBaseFiltersRequest {
  q?: string
}

// Driver Response
export interface IDriverResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  active: boolean
  truckId: number | null
  created: string
  updated: string
}

// Drivers List Response (paginated)
export type IDriversResponse = IPaginatedResponse<IDriverResponse>

// Base Driver Data (common fields for create/update)
export interface IDriverData {
  firstName: string
  lastName: string
  email: string
  phone: string
  active: boolean
}

// Create Driver Request (POST /drivers)
export type ICreateDriverRequest = IDriverData

// Update Driver Request (PUT /drivers/:id)
export type IUpdateDriverRequest = Partial<ICreateDriverRequest>
