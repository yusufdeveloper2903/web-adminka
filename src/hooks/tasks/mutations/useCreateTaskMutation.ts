import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"
import type { ITaskCreateRequest, ITaskResponse } from "@/types/tasks"

const createTask = async (data: ITaskCreateRequest): Promise<ITaskResponse> => {
  const response = await api.post<ITaskResponse>("api/v1/tasks/task/", data)
  return (response as any).data ?? (response as any)
}

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    createMutationConfig(createTask, "task" as any, "create", () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    })
  )
}


