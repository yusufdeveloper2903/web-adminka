import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateDispatcherMutation, useUpdateDispatcherMutation } from "@/hooks/dispatchers"
import type { IDispatcherData, IDispatcherResponse } from "@/types"

// Zod validation schema
const dispatcherFormSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  teamId: z.string().min(1, "Team is required")
})

interface UseDispatcherFormProps {
  dispatcher?: IDispatcherResponse
}

export const useDispatcherForm = ({ dispatcher }: UseDispatcherFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createDispatcherMutation = useCreateDispatcherMutation()
  const updateDispatcherMutation = useUpdateDispatcherMutation()

  const isEditing = !!dispatcher

  const form = useForm({
    defaultValues: {
      firstName: dispatcher?.firstName || "",
      lastName: dispatcher?.lastName || "",
      teamId: dispatcher?.teamId?.toString() || ""
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = dispatcherFormSchema.parse(value)

        const dispatcherData: IDispatcherData = {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          teamId: parseInt(validatedData.teamId)
        }

        console.log("Dispatcher data for backend:", dispatcherData)

        if (isEditing && dispatcher) {
          // Update dispatcher
          await updateDispatcherMutation.mutateAsync({
            id: dispatcher.id,
            data: dispatcherData
          })
        } else {
          // Create dispatcher
          await createDispatcherMutation.mutateAsync(dispatcherData)
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
          console.error("Failed to save dispatcher:", error)
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
    dispatcherFormSchema,
    isSubmitting: isEditing ? updateDispatcherMutation.isPending : createDispatcherMutation.isPending,
    isEditing
  }
}
