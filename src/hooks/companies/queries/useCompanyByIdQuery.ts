import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IApiResponse, ICompanyResponse } from "@/types"

const fetchCompany = async (id: number): Promise<ICompanyResponse> => {
  const response = await api.get<IApiResponse<ICompanyResponse>>(`/companies/${id}`)
  return response.data.data
}

export const useCompanyByIdQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => fetchCompany(id),
    enabled: enabled && !!id
  })
}
