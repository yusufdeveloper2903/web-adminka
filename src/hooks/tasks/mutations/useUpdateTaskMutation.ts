import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { ITaskCreateRequest, ITaskResponse } from "@/types/tasks"

interface UpdateArgs {
  id: number
  data: ITaskCreateRequest
}

const updateTask = async ({ id, data }: UpdateArgs): Promise<ITaskResponse> => {
  const response = await api.patch<ITaskResponse>(`api/v1/tasks/task/${id}/`, data)
  return (response as any).data ?? (response as any)
}

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(updateTask, "task" as any, "update", () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    })
  )
}


