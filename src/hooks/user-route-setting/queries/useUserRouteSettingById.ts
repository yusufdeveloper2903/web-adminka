import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, IUserRouteSettingResponse } from "@/types"

const fetchUserRouteSettingById = async (userId: number): Promise<IUserRouteSettingResponse> => {
  const response = await api.get<IApiResponse<IUserRouteSettingResponse>>(`/user-route-setting/${userId}`)
  return response.data.data
}

export const useUserRouteSettingById = (userId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["user-route-setting", userId],
    queryFn: () => fetchUserRouteSettingById(userId),
    enabled: enabled && !!userId
  })
}
