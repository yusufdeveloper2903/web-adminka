import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITruckResponse } from "@/types"

const fetchTruck = async (id: number): Promise<ITruckResponse> => {
  const response = await api.get<IApiResponse<ITruckResponse>>(`/trucks/${id}`)
  return response.data.data
}

export const useTruckQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["truck", id],
    queryFn: () => fetchTruck(id),
    enabled: enabled && !!id
  })
}
