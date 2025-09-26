import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse } from "@/types"

export interface AssignUserToDriversRequest {
  userId: number
  driverIds: number[]
}

// POST /drivers/assign-user
const assignUserToDrivers = async (payload: AssignUserToDriversRequest): Promise<unknown> => {
  const response = await api.post<IApiResponse<unknown>>("/drivers/assign-user", payload)
  return response.data.data
}

export const useAssignUserToDriversMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(assignUserToDrivers, "drivers", "update", () => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    })
  )
}


