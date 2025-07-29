import type { IPaginatedResponse } from "./api"

export interface IUserRouteSettingsResponse {
  id: number
  email: string
  active: boolean
}

export type IUserRouteSettingsResponsse = IPaginatedResponse<IUserRouteSettingsResponse>

export interface IUserRouteSettingsData {
  email: string
}

export type IUserRouteSettingsRequest = IUserRouteSettingsData

export type IUserRouteSettingsUpdateRequest = IUserRouteSettingsData
