import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, IUserResponse } from "@/types"

const fetchUser = async (id: number): Promise<IUserResponse> => {
  const response = await api.get<IApiResponse<IUserResponse>>(`/users/${id}`)
  return response.data.data
}

export const useUserByIdQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    enabled: enabled && !!id
  })
}
