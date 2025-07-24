import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateTeamRequest, ITeamResponse } from "@/types"

const updateTeam = async (id: number, data: IUpdateTeamRequest): Promise<ITeamResponse> => {
  const response = await api.put<IApiResponse<ITeamResponse>>(`/teams/${id}`, data)
  return response.data.data
}

export const useUpdateTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateTeamRequest }) => updateTeam(id, data),
      "team",
      "update",
      (data, variables) => {
        // Invalidate and update specific team query
        queryClient.invalidateQueries({ queryKey: ["team", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["teams"] })
      }
    )
  )
}
