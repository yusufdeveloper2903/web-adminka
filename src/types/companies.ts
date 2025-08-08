import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

export type ICompaniesFiltersRequest = IBaseFiltersRequest

export interface ICompanyResponse {
  id: number
  name: string
  email: string
  mc: number | null
  usDot: string
  phone: string
  active: boolean
  created: string
  updated: string
}

export type ICompaniesResponse = IPaginatedResponse<ICompanyResponse>

export interface ICompanyData {
  name: string
  email: string
  mc?: number | null
  usDot: string
  phone: string
}

export type ICreateCompanyRequest = ICompanyData

export type IUpdateCompanyRequest = ICompanyData

export type IChangeCompanyTokensRequest = {
  samsaraToken: string
  gleToken: string
}
