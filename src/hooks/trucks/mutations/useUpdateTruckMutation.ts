import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, IUpdateTruckRequest, ITruckResponse } from "@/types"

const updateTruck = async (id: number, data: IUpdateTruckRequest): Promise<ITruckResponse> => {
  const response = await api.put<IApiResponse<ITruckResponse>>(`/trucks/${id}`, data)
  return response.data.data
}

export const useUpdateTruckMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(
      ({ id, data }: { id: number; data: IUpdateTruckRequest }) => updateTruck(id, data),
      'truck',
      'update',
      (data, variables) => {
        // Invalidate and update specific truck query
        queryClient.invalidateQueries({ queryKey: ["truck", variables.id] })
        queryClient.invalidateQueries({ queryKey: ["trucks"] })
      }
    )
  )
}
