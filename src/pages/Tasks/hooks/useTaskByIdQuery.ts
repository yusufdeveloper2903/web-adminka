import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { ITaskResponse } from "@/types/tasks"

const fetchTaskById = async (id: number): Promise<ITaskResponse> => {
  const response = await api.get<ITaskResponse>(`api/v1/tasks/task/${id}/`)
  return (response as any).data ?? (response as any)
}

export const useTaskByIdQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTaskById(id),
    enabled
  })
}


