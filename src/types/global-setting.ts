export type GlobalSettingType = "TRIP"

export interface IGlobalSettingResponse {
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
