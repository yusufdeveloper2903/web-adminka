import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"

interface QuestionData {
  answer: string
  type: "CHOICE" | "WRITTEN"
  option: string[]
  index: number
  point: number | null
  dop_point: number | null
}

export interface UpdateQuestionRequest {
  task_id: number | string
  question_data: QuestionData[]
}

const updateQuestions = async ({ task_id, question_data }: UpdateQuestionRequest): Promise<any> => {
  const response = await api.patch(`api/v1/tasks/update_questions/${task_id}/`, { question_data })
  return (response as any).data ?? (response as any)
}

export const useUpdateQuestionsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation(
    createMutationConfig(updateQuestions, "task" as any, "update", () => {
      queryClient.invalidateQueries({ queryKey: ["task-questions"] })
    })
  )
}


