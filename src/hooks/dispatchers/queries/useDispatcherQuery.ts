import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, IDispatcherResponse } from "@/types"

const fetchDispatcher = async (id: number): Promise<IDispatcherResponse> => {
  const response = await api.get<IApiResponse<IDispatcherResponse>>(`/dispatchers/${id}`)
  return response.data.data
}

export const useDispatcherQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dispatcher", id],
    queryFn: () => fetchDispatcher(id),
    enabled: enabled && !!id
  })
}
