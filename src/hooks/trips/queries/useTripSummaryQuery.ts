import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripSummaryRequest, ITripSummaryResponse } from "@/types"

const fetchTripSummary = async (params: ITripSummaryRequest): Promise<ITripSummaryResponse> => {
  const response = await api.get<IApiResponse<ITripSummaryResponse>>("/trips/summary", { params })
  return response.data.data
}

export const useTripSummaryQuery = (params: ITripSummaryRequest, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trip-summary", params],
    queryFn: () => fetchTripSummary(params),
    enabled: enabled && !!params.truckId && !!params.loadNumber
  })
}
