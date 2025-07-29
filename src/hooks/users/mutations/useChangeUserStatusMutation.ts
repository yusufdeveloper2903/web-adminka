import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeStatusRequest, IChangeStatusResponse } from "@/types"

const changeUserStatus = async ({ id, active }: IChangeStatusRequest): Promise<IChangeStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeStatusResponse>>(`/users/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeUserStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(changeUserStatus, "user", "status", (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    })
  )
}
