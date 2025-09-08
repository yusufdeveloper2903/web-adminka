import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useDrawerStore, useDispatchersStore } from "@/store"
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

  const { newTeamData, setNewTeamData, resetNewTeamData } = useDispatchersStore()

  const initialValues = { name: "" }

  const form = useForm({
    defaultValues: isEditing ? { name: team?.name || "" } : { ...initialValues, ...newTeamData },
    validators: {
      onChange: teamFormSchema
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = teamFormSchema.parse(value)

        const teamData: ITeamData = {
          name: validatedData.name
        }

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
        // After successful creation, reset to initial values and clear persisted store
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

  // Persist changes in create mode
  useEffect(() => {
    if (isEditing) return
    const unsubscribe = form.store.subscribe((state: any) => {
      if (state.values) setNewTeamData(state.values)
    })
    return unsubscribe
  }, [isEditing, form, setNewTeamData])

  // Snapshot on unmount
  useEffect(() => {
    return () => {
      if (!isEditing) {
        const latest = (form as any)?.state?.values
        if (latest) setNewTeamData(latest)
      }
    }
  }, [isEditing, form, setNewTeamData])

  const resetForm = () => {
    if (!isEditing) {
      resetNewTeamData()
    }
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
