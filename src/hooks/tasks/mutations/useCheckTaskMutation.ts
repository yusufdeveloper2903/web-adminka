import { useMutation } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"

export interface CheckTaskRequest {
  tg_id: number
  task_number: string | number
}

export interface CheckTaskQuestionItem {
  id: number
  option: string[]
  type: "CHOICE" | "WRITTEN"
  index: number
}

export interface CheckTaskResponse {
  questions: CheckTaskQuestionItem[]
}

const checkTask = async (data: CheckTaskRequest): Promise<CheckTaskResponse> => {
  const response = await api.get("api/v1/client/check_task/", {
    params: { tg_id: data.tg_id, task_number: data.task_number }
  })
  return (response as any).data ?? (response as any)
}

export const useCheckTaskMutation = () => {
  return useMutation({
    mutationFn: checkTask,
    onSuccess: () => {},
    onError: () => {}
  })
}


