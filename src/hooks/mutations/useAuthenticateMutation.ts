import { useMutation } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, IAuthenticateRequest, IAuthenticateResponse } from "@/types"

const authenticateUser = async (credentials: IAuthenticateRequest): Promise<IApiResponse<IAuthenticateResponse>> => {
  const response = await api.post('/authenticate', credentials)
  return response.data
}

const useAuthenticateMutation = () => {
  return useMutation({
    mutationFn: authenticateUser,
    onSuccess: (data) => {
      // Save tokens to localStorage
      const { accessToken, refreshToken } = data.data
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    },
    onError: (error) => {
      console.error('Authentication failed:', error)
      // Clear any existing tokens on error
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  })
}

export default useAuthenticateMutation