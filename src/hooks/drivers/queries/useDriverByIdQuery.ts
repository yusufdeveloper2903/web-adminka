import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ITruckResponse } from "@/types"

const fetchDriver = async (id: number): Promise<ITruckResponse> => {
  const response = await api.get<IApiResponse<ITruckResponse>>(`/drivers/${id}`)
  return response.data.data
}

export const useDriverByIdQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["driver", id],
    queryFn: () => fetchDriver(id),
    enabled: enabled && !!id
  })
}
