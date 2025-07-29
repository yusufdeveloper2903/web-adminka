import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

export type IUsersFiltersRequest = IBaseFiltersRequest

export interface IUserResponse {
  id: number
  email: string
  active: boolean
  role: string
  firstName: string
  lastName: string
  phone: string
  created: string
  updated: string
}

export type IUsersResponse = IPaginatedResponse<IUserResponse>

export interface IUserData {
  name: string
  email: string
  mc?: number | null
  usDot: string
  phone: string
}

export type ICreateUserRequest = IUserData

export type IUpdateUserRequest = IUserData
