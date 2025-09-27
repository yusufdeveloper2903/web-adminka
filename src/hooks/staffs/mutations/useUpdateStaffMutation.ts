import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IStaffCreateRequest, IStaffResponse } from "@/types/staffs"

interface UpdateArgs {
  id: number
  data: IStaffCreateRequest
}

const updateStaff = async ({ id, data }: UpdateArgs): Promise<IStaffResponse> => {
  const response = await api.patch<IStaffResponse>(`api/v1/staffs/staffs/${id}/`, data)
  return (response.data as any).data ?? (response.data as any)
}

export const useUpdateStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(updateStaff, "staff", "update", () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] })
    })
  )
}


