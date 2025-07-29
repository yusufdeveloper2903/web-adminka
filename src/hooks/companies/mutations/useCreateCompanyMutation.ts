import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateCompanyRequest, ICompanyResponse } from "@/types"

const createCompany = async (data: ICreateCompanyRequest): Promise<ICompanyResponse> => {
  const response = await api.post<IApiResponse<ICompanyResponse>>("/companies", data)
  return response.data.data
}

export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createCompany, "company", "create", () => {
      // Invalidate companies queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    })
  )
}
