import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateProfileRequest, IUser } from "@/types"

const updateProfile = async (data: IUpdateProfileRequest): Promise<IUser> => {
  const response = await api.post<IApiResponse<IUser>>("/profile", data)
  return response.data.data
}

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(updateProfile, "user", "update", () => {
      // Invalidate companies queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["me"] })
    })
  )
}
