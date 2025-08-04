import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { GlobalSettingType, IApiResponse, IGlobalSettingResponse } from "@/types"

const fetchGlobalSettingByType = async (type: GlobalSettingType = "TRIP"): Promise<IGlobalSettingResponse> => {
  const response = await api.get<IApiResponse<IGlobalSettingResponse>>(`/global-setting/${type}`)
  return response.data.data
}

export const useGlobalSettingByType = (type: GlobalSettingType = "TRIP", enabled: boolean = true) => {
  return useQuery({
    queryKey: ["global-setting", type],
    queryFn: () => fetchGlobalSettingByType(type),
    enabled: enabled && !!type
  })
}
