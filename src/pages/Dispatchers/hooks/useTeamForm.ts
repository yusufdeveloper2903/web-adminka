import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateTeamMutation, useUpdateTeamMutation } from "@/hooks/teams"
import type { ITeamData, ITeamResponse } from "@/types"

// Zod validation schema
const teamFormSchema = z.object({
  name: z.string().min(1, "Team Name is required")
})

interface UseTeamFormProps {
  team?: ITeamResponse
}

export const useTeamForm = ({ team }: UseTeamFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createTeamMutation = useCreateTeamMutation()
  const updateTeamMutation = useUpdateTeamMutation()

  const isEditing = !!team

  const form = useForm({
    defaultValues: {
      name: team?.name || ""
    },
    validators: {
      onChange: teamFormSchema
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = teamFormSchema.parse(value)

        const teamData: ITeamData = {
          name: validatedData.name
        }

        console.log("Team data for backend:", teamData)

        if (isEditing && team) {
          // Update team
          await updateTeamMutation.mutateAsync({
            id: team.id,
            data: teamData
          })
        } else {
          // Create team
          await createTeamMutation.mutateAsync(teamData)
        }

        // Close drawer on success
        closeDrawer()

        // Reset form after successful creation/update
        if (!isEditing) {
          resetForm()
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save team:", error)
        }
      }
    }
  })

  const resetForm = () => {
    form.reset()
  }

  return {
    form,
    resetForm,
    teamFormSchema,
    isSubmitting: isEditing ? updateTeamMutation.isPending : createTeamMutation.isPending,
    isEditing
  }
}
