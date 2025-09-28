import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

const deleteTask = async (id: number): Promise<number> => {
  await api.delete(`api/v1/tasks/task/${id}/`)
  return id
}

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success("Task deleted successfully!")
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    }
  })
}


