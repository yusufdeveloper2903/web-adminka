import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

// Shop API Request/Response interfaces with I prefix

// GET /api/v1/shops filters (uses base filters only)
export type IShopsFiltersRequest = IBaseFiltersRequest

// Shop Response
export interface IShopResponse {
  id: number
  name: string
  location: string
  latitude: number
  longitude: number
  active: boolean
  createdAt: string
  updatedAt: string
}

// Shops List Response (paginated)
export type IShopsResponse = IPaginatedResponse<IShopResponse>

// Base Shop Data (common fields for create/update)
export interface IShopData {
  name: string
  location: string
  latitude: number
  longitude: number
}

// Create Shop Request (POST /api/v1/shops)
export type ICreateShopRequest = IShopData

// Update Shop Request (PUT /api/v1/shops/{id})
export type IUpdateShopRequest = IShopData
