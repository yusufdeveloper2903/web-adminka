import { useMutation } from "@tanstack/react-query"
import api from "@/lib/axios"

export interface CreateClientRequest {
  tg_id: number
}

const createClient = async (data: CreateClientRequest): Promise<any> => {
  const response = await api.post("api/v1/client/client/", data)
  return (response as any).data ?? (response as any)
}

export const useCreateClientMutation = () => {
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {},
    onError: () => {}
  })
}
