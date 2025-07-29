import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateUserRequest, IUserResponse } from "@/types"

const updateUser = async (id: number, data: IUpdateUserRequest): Promise<IUserResponse> => {
  const response = await api.put<IApiResponse<IUserResponse>>(`/users/${id}`, data)
  return response.data.data
}

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateUserRequest }) => updateUser(id, data),
      "user",
      "update",
      (data, variables) => {
        // Invalidate and update specific user query
        queryClient.invalidateQueries({ queryKey: ["user", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["users"] })
      }
    )
  )
}
