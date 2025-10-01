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

export interface CreateQuestionRequest {
  user_id?: number
  question_data: QuestionData[]
}

const createQuestion = async (data: CreateQuestionRequest): Promise<any> => {
  const response = await api.post("api/v1/tasks/create_question/", data)
  return (response as any).data ?? (response as any)
}

export const useCreateQuestionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation(
    createMutationConfig(createQuestion, "task" as any, "create", () => {
      queryClient.invalidateQueries({ queryKey: ["task-questions"] })
    })
  )
}

