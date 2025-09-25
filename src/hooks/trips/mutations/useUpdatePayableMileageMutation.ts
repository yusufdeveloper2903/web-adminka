import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse } from "@/types"

export interface UpdatePayableMileageRequest {
  tripId: number
  payableMileage: number
}

// PUT /mile-stats/payable-mileage
const updatePayableMileage = async (payload: UpdatePayableMileageRequest): Promise<unknown> => {
  const response = await api.put<IApiResponse<unknown>>("/mile-stats/payable-mileage", payload)
  return response.data.data
}

export const useUpdatePayableMileageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(updatePayableMileage, "trip", "update", (_data, variables) => {
      // Refresh related caches
      queryClient.invalidateQueries({ queryKey: ["trip-report-summary"] })
      queryClient.invalidateQueries({ queryKey: ["trip", (variables as UpdatePayableMileageRequest).tripId] })
      queryClient.invalidateQueries({ queryKey: ["trips"] })
    })
  )
}


