import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateGlobalSettingRequest, IGlobalSettingResponse } from "@/types"

const createGlobalSetting = async (data: ICreateGlobalSettingRequest): Promise<IGlobalSettingResponse> => {
  const response = await api.post<IApiResponse<IGlobalSettingResponse>>("/global-setting", data)
  return response.data.data
}

export const useCreateGlobalSettingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createGlobalSetting, "globalSetting", "create", () => {
      queryClient.invalidateQueries({ queryKey: ["global-setting"] })
    })
  )
}
