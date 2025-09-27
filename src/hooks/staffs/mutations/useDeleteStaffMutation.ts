import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

const deleteStaff = async (id: number): Promise<number> => {
  await api.delete(`api/v1/staffs/staffs/${id}/`)
  return id
}

export const useDeleteStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success("Staff deleted successfully!")
      queryClient.invalidateQueries({ queryKey: ["staffs"] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    }
  })
}


