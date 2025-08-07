import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripVehicleByLoadNumberResponse } from "@/types"

const fetchTripVehicleInfoByLoadNumber = async (loadNumber: string): Promise<ITripVehicleByLoadNumberResponse> => {
  const response = await api.get<IApiResponse<ITripVehicleByLoadNumberResponse>>(`/trips/vehicle/info-by-load-number`, {
    params: { loadNumber }
  })
  return response.data.data
}

export const useTripVehicleInfoByLoadNumber = (loadNumber: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["vehicle", "info-by-load-number", loadNumber],
    queryFn: () => fetchTripVehicleInfoByLoadNumber(loadNumber),
    enabled: enabled && !!loadNumber
  })
}
