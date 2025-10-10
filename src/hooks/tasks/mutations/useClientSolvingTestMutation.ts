import { useMutation } from "@tanstack/react-query"
import api from "@/lib/axios"
import { createMutationConfig } from "@/lib/mutation-utils"

export interface ClientSolvingTestItem {
  question: number
  answer: string
}

export interface ClientSolvingTestRequest {
  tg_id: number
  data: {
    answers: ClientSolvingTestItem[]
    task_number: number
  }
}

const clientSolvingTest = async (payload: ClientSolvingTestRequest): Promise<any> => {
  const response = await api.post("api/v1/client/client_solving_test/", payload.data, {
    params: { tg_id: payload.tg_id }
  })
  return (response as any).data ?? (response as any)
}

export const useClientSolvingTestMutation = () => {
  return useMutation({
    mutationFn: clientSolvingTest,
    onSuccess: () => {},
    onError: () => {}
  })
}
