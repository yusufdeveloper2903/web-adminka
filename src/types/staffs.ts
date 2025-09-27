export interface IStaffCreateRequest {
  username: string
  first_name: string
  sur_name: string
  mid_name: string
}

export interface IStaffResponse {
  id: number
  username: string
  first_name: string
  sur_name: string
  mid_name: string
  created?: string
  updated?: string
}


