import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateUserRouteSettingRequest, IUserRouteSettingResponse } from "@/types"

const createUserRouteSetting = async (data: ICreateUserRouteSettingRequest): Promise<IUserRouteSettingResponse> => {
  const response = await api.post<IApiResponse<IUserRouteSettingResponse>>("/user-route-setting", data)
  return response.data.data
}

export const useCreateUserRouteSettingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createUserRouteSetting, "userRouteSetting", "create", () => {
      queryClient.invalidateQueries({ queryKey: ["user-route-setting"] })
    })
  )
}
