import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateDispatcherRequest, IDispatcherResponse } from "@/types"

const updateDispatcher = async (id: number, data: IUpdateDispatcherRequest): Promise<IDispatcherResponse> => {
  const response = await api.put<IApiResponse<IDispatcherResponse>>(`/dispatchers/${id}`, data)
  return response.data.data
}

export const useUpdateDispatcherMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateDispatcherRequest }) => updateDispatcher(id, data),
      "dispatcher",
      "update",
      (data, variables) => {
        // Invalidate and update specific dispatcher query
        queryClient.invalidateQueries({ queryKey: ["dispatcher", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["dispatchers"] })
      }
    )
  )
}
