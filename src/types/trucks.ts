import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

// GET /api/v1/trucks filters
export interface ITrucksFiltersRequest extends IBaseFiltersRequest {
  driverId?: number
}

// Truck Response
export interface ITruckResponse {
  id: number
  active: boolean
  companyId: number
  companyName: string
  createdAt: string
  driverNames: string
  homeLatitude: number
  homeLocation: string
  homeLongitude: number
  licencePlate: string
  unitNumber: string
  samsaraVin: string
  updated: string
  vehicleId: string
  vinNumber: string
}

// Trucks List Response (paginated)
export type ITrucksResponse = IPaginatedResponse<ITruckResponse>

// Base Truck Data (common fields for create/update)
export interface ITruckData {
  vinNumber: string
  unitNumber: string
  samsaraVin: string
  homeLocation: string
  homeLatitude?: number
  homeLongitude?: number
  licencePlate: string
}

// Create Truck Request (POST /api/v1/trucks)
export type ICreateTruckRequest = ITruckData

// Update Truck Request (PUT /api/v1/trucks/{id})
export type IUpdateTruckRequest = ITruckData
