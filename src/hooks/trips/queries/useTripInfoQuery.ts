import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripInfoResponse } from "@/types"

const fetchTripInfo = async (id: number): Promise<ITripInfoResponse> => {
  const response = await api.get<IApiResponse<ITripInfoResponse>>(`/trips/info/${id}`)
  return response.data.data
}

export const useTripInfoQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trip-info", id],
    queryFn: () => fetchTripInfo(id),
    enabled: enabled && !!id
  })
}
