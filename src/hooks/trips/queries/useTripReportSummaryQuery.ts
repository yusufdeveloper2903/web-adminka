import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripSummaryRequest, ITripReportSummaryResponse } from "@/types"

const fetchTripReportSummary = async (params: ITripSummaryRequest): Promise<ITripReportSummaryResponse> => {
  const response = await api.get<IApiResponse<ITripReportSummaryResponse>>("/trips/report-summary", { params })
  return response.data.data
}

export const useTripReportSummaryQuery = (params: ITripSummaryRequest, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trip-report-summary", params],
    queryFn: () => fetchTripReportSummary(params),
    enabled: enabled && !!params.truckId && !!params.loadNumber
  })
}
