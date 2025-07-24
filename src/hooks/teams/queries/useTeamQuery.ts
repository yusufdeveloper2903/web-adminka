import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITeamResponse } from "@/types"

const fetchTeam = async (id: number): Promise<ITeamResponse> => {
  const response = await api.get<IApiResponse<ITeamResponse>>(`/teams/${id}`)
  return response.data.data
}

export const useTeamQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["team", id],
    queryFn: () => fetchTeam(id),
    enabled: enabled && !!id
  })
}
