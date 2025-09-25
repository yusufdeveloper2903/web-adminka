import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripVehicleByLoadNumberResponse, IdentifierType } from "@/types"

interface VehicleInfoByIdentifierParams {
  number: string
  identifierType: IdentifierType
}

const fetchTripVehicleInfoByIdentifierNumber = async (
  params: VehicleInfoByIdentifierParams
): Promise<ITripVehicleByLoadNumberResponse> => {
  const response = await api.get<IApiResponse<ITripVehicleByLoadNumberResponse>>(
    `/trips/vehicle/info-by-identifier-number`,
    { params }
  )
  return response.data.data
}

export const useTripVehicleInfoByIdentifierNumber = (
  params: VehicleInfoByIdentifierParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["vehicle", "info-by-identifier-number", params],
    queryFn: () => fetchTripVehicleInfoByIdentifierNumber(params),
    enabled: enabled && !!params.number
  })
}


