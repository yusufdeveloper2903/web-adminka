export interface IUserRouteSettingResponse {
  created: string
  distanceUnit: string
  id: number
  routingType: string
  trailerType: string
  updated: string
  userId: number
}

// Base Truck Data (common fields for create/update)
export interface IUserRouteSettingData {
  userId: number
  trailerType: "TRAILER_53" | ""
  routingType: "PRACTICAL" | "SHORTEST"
  distanceUnit: "MILES" | "KM"
}

export type ICreateUserRouteSettingRequest = IUserRouteSettingData

export type IUpdateUserRouteSettingRequest = IUserRouteSettingData
