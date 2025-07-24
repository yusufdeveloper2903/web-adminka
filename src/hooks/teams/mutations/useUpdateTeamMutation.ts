import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage, getStatusErrorMessage } from "@/lib/error-utils"
import type { IApiResponse, IUpdateTeamRequest, ITeamResponse } from "@/types"

const updateTeam = async (id: number, data: IUpdateTeamRequest): Promise<ITeamResponse> => {
  const response = await api.put<IApiResponse<ITeamResponse>>(`/teams/${id}`, data)
  return response.data.data
}

export const useUpdateTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateTeamRequest }) => updateTeam(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and update specific team query
      queryClient.invalidateQueries({ queryKey: ["team", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })

      // Show success toast
      toast.success("Team updated successfully!")
    },
    onError: (error: any) => {
      console.error("Update team failed:", error)

      // Prioritize server error message, then fallback to generic messages
      let errorMessage = error?.response?.data?.message || getErrorMessage(error)

      // Provide more specific messages based on status
      if (error?.response?.status) {
        const status = error.response.status
        if (status === 400) {
          errorMessage = error?.response?.data?.message || "Invalid team data. Please check your input and try again."
        } else if (status === 404) {
          errorMessage = error?.response?.data?.message || "Team not found."
        } else if (status === 409) {
          errorMessage = error?.response?.data?.message || "Team with this name already exists."
        } else if (status === 500) {
          errorMessage = error?.response?.data?.message || "Server error. Please try again later."
        } else {
          errorMessage = error?.response?.data?.message || getStatusErrorMessage(status)
        }
      }

      // Show error toast
      toast.error(errorMessage)
    }
  })
}
