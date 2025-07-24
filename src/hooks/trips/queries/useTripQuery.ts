import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripResponse } from "@/types"

const fetchTrip = async (id: number): Promise<ITripResponse> => {
  const response = await api.get<IApiResponse<ITripResponse>>(`/trips/${id}`)
  return response.data.data
}

export const useTripQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => fetchTrip(id),
    enabled: enabled && !!id
  })
}
