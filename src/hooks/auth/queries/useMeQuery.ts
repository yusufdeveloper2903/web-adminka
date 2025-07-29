import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, IUserResponse } from "@/types"

const fetchMe = async (): Promise<IUserResponse> => {
  const response = await api.get<IApiResponse<IUserResponse>>(`/me`)
  return response.data.data
}

export const useMeQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe(),
    enabled: enabled
  })
}
