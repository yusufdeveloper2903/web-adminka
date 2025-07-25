import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITripDetailResponse } from "@/types"

const fetchTripById = async (id: number): Promise<ITripDetailResponse> => {
  const response = await api.get<IApiResponse<ITripDetailResponse>>(`/trips/${id}`)
  return response.data.data
}

export const useTripByIdQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => fetchTripById(id),
    enabled: enabled && !!id
  })
}
