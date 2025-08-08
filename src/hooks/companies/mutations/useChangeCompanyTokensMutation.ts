import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeCompanyTokensRequest, ICompanyResponse } from "@/types"

const changeCompanyTokens = async (companyId: number, data: IChangeCompanyTokensRequest): Promise<ICompanyResponse> => {
  const response = await api.put<IApiResponse<ICompanyResponse>>(`/companies/change-tokens/${companyId}`, data)
  return response.data.data
}

export const useChangeCompanyTokensMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ companyId, data }: { companyId: number; data: IChangeCompanyTokensRequest }) =>
        changeCompanyTokens(companyId, data),
      "changeCompanyTokens",
      "update",
      (data, variables) => {
        // Invalidate and update specific company query
        queryClient.invalidateQueries({ queryKey: ["company", variables.companyId] })
        queryClient.invalidateQueries({ queryKey: ["companies"] })
      }
    )
  )
}
