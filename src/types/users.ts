import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

export type UserRoleType = "OWNER" | "MANAGER" | "USER"

export type IUsersFiltersRequest = IBaseFiltersRequest

export interface IUserResponse {
  id: number
  email: string
  active: boolean
  role: UserRoleType
  firstName: string
  lastName: string
  phone: string
  created: string
  updated: string
}

export type IUsersResponse = IPaginatedResponse<IUserResponse>

export interface IUserData {
  email: string
  phone: string
  firstName: string
  lastName: string
  role: UserRoleType
}

export type ICreateUserRequest = IUserData

export type IUpdateUserRequest = IUserData
