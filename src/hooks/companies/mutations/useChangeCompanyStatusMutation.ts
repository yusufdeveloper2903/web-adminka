import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IChangeStatusRequest, IChangeStatusResponse } from "@/types"

const changeCompanyStatus = async ({ id, active }: IChangeStatusRequest): Promise<IChangeStatusResponse> => {
  const response = await api.patch<IApiResponse<IChangeStatusResponse>>(`/companies/change-status/${id}`, null, {
    params: { active }
  })
  return response.data.data
}

export const useChangeCompanyStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(changeCompanyStatus, "company", "status", (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    })
  )
}
