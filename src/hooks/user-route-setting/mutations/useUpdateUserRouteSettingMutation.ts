import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateUserRouteSettingRequest, IUserRouteSettingResponse } from "@/types"

const updateUserRouteSetting = async (
  id: number,
  data: IUpdateUserRouteSettingRequest
): Promise<IUserRouteSettingResponse> => {
  const response = await api.put<IApiResponse<IUserRouteSettingResponse>>(`/user-route-setting/${id}`, data)
  return response.data.data
}

export const useUpdateUserRouteSettingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateUserRouteSettingRequest }) => updateUserRouteSetting(id, data),
      "userRouteSetting",
      "update",
      (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["user-route-setting", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["user-route-setting"] })
      }
    )
  )
}
