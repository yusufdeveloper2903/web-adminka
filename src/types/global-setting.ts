import type { IPaginatedResponse } from "./api"

export type GlobalSettingType = "TRIP"

export interface IGlobalSettingData {
  id: number
  homeRadius: number
  shopRadius: number
  pickupRadius: number
  trailerRadius: number
  deliveryRadius: number
  samsaraEnabled: boolean
  gleEnabled: boolean
  type: GlobalSettingType
  created: string
  updated: string
}

// Trucks List Response (paginated)
export type IGlobalSettingResponse = IPaginatedResponse<IGlobalSettingData>

// Base Truck Data (common fields for create/update)
export interface IGlobalSettingData {
  homeRadius: number
  shopRadius: number
  pickupRadius: number
  trailerRadius: number
  deliveryRadius: number
  samsaraEnabled: boolean
  gleEnabled: boolean
  type: GlobalSettingType
}

export type ICreateGlobalSettingRequest = IGlobalSettingData

export type IUpdateGlobalSettingRequest = IGlobalSettingData & { id: number }
