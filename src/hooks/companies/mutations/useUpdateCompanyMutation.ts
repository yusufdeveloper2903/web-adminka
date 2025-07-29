import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateCompanyRequest, ICompanyResponse } from "@/types"

const updateCompany = async (id: number, data: IUpdateCompanyRequest): Promise<ICompanyResponse> => {
  const response = await api.put<IApiResponse<ICompanyResponse>>(`/companies/${id}`, data)
  return response.data.data
}

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateCompanyRequest }) => updateCompany(id, data),
      "company",
      "update",
      (data, variables) => {
        // Invalidate and update specific company query
        queryClient.invalidateQueries({ queryKey: ["company", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["companies"] })
      }
    )
  )
}
