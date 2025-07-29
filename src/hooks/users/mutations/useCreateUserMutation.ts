import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateUserRequest, IUserResponse } from "@/types"

const createUser = async (data: ICreateUserRequest): Promise<IUserResponse> => {
  const response = await api.post<IApiResponse<IUserResponse>>("/users", data)
  return response.data.data
}

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createUser, "user", "create", () => {
      // Invalidate users queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["users"] })
    })
  )
}
