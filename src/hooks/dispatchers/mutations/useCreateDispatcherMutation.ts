import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateDispatcherRequest, IDispatcherResponse } from "@/types"

const createDispatcher = async (data: ICreateDispatcherRequest): Promise<IDispatcherResponse> => {
  const response = await api.post<IApiResponse<IDispatcherResponse>>("/dispatchers", data)
  return response.data.data
}

export const useCreateDispatcherMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createDispatcher, "dispatcher", "create", () => {
      // Invalidate dispatchers queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["dispatchers"] })
    })
  )
}
