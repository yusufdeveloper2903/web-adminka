export interface IAuthenticateRequest {
  email: string
  password: string
}

export interface IAuthenticateResponse {
  accessToken: string
  refreshToken: string
}

export interface IRefreshTokenRequest {
  refreshToken: string
}

export interface IRefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface IUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  createdAt: string
  updatedAt: string
}