import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateGlobalSettingRequest, IGlobalSettingResponse } from "@/types"

const updateGlobalSetting = async (id: number, data: IUpdateGlobalSettingRequest): Promise<IGlobalSettingResponse> => {
  const response = await api.put<IApiResponse<IGlobalSettingResponse>>(`/global-setting/${id}`, data)
  return response.data.data
}

export const useUpdateGlobalSettingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateGlobalSettingRequest }) => updateGlobalSetting(id, data),
      "globalSetting",
      "update",
      (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["global-setting", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["global-setting"] })
      }
    )
  )
}
