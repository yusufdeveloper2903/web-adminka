import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeStatusRequest, IChangeStatusResponse } from "@/types"

const changeTeamStatus = async ({ id, active }: IChangeStatusRequest): Promise<IChangeStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeStatusResponse>>(`/teams/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeTeamStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(changeTeamStatus, "team", "status", (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["team", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    })
  )
}
