import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse, ICreateTruckRequest, ITruckResponse } from "@/types"

const createTruck = async (data: ICreateTruckRequest): Promise<ITruckResponse> => {
  const response = await api.post<IApiResponse<ITruckResponse>>("/trucks", data)
  return response.data.data
}

export const useCreateTruckMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createTruck, "truck", "create", () => {
      // Invalidate trucks queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["trucks"] })
    })
  )
}
