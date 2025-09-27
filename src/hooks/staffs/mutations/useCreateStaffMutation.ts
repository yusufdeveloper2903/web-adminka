import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { IApiResponse } from "@/types/api"
import type { IStaffCreateRequest, IStaffResponse } from "@/types/staffs"

const createStaff = async (data: IStaffCreateRequest): Promise<IStaffResponse> => {
  const response = await api.post<IApiResponse<IStaffResponse>>("api/v1/staffs/staffs/", data)
  return (response.data as any).data ?? (response.data as any)
}

export const useCreateStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createStaff, "staff", "create", () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] })
    })
  )
}


