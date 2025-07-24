import type { IBaseFiltersRequest, IPaginatedResponse } from "./api"

// Team API Request/Response interfaces with I prefix

// GET /api/v1/teams filters (uses base filters only)
export type ITeamsFiltersRequest = IBaseFiltersRequest

// Team Response
export interface ITeamResponse {
  id: number
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// Teams List Response (paginated)
export type ITeamsResponse = IPaginatedResponse<ITeamResponse>

// Base Team Data (common fields for create/update)
export interface ITeamData {
  name: string
}

// Create Team Request (POST /api/v1/teams)
export type ICreateTeamRequest = ITeamData

// Update Team Request (PUT /api/v1/teams/{id})
export type IUpdateTeamRequest = ITeamData
