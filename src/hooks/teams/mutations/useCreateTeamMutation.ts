import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateTeamRequest, ITeamResponse } from "@/types"

const createTeam = async (data: ICreateTeamRequest): Promise<ITeamResponse> => {
  const response = await api.post<IApiResponse<ITeamResponse>>("/teams", data)
  return response.data.data
}

export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createTeam, "team", "create", () => {
      // Invalidate teams queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    })
  )
}
