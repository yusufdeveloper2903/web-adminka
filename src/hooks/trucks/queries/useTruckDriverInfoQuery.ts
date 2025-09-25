import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITruckDriverInfoResponse } from "@/types"

const fetchTruckDriverInfo = async (id: number): Promise<ITruckDriverInfoResponse> => {
  const response = await api.get<IApiResponse<ITruckDriverInfoResponse>>(`/trucks/driver-info/${id}`)
  return response.data.data
}

export const useTruckDriverInfoQuery = (id: number | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["truck-driver-info", id],
    queryFn: () => fetchTruckDriverInfo(id as number),
    enabled: enabled && !!id
  })
}


