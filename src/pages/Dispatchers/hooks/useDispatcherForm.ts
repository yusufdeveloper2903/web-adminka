import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useDrawerStore, useDispatchersStore } from "@/store"
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

  const { newDispatcherData, setNewDispatcherData, resetNewDispatcherData } = useDispatchersStore()

  const initialValues = {
    firstName: "",
    lastName: "",
    teamId: ""
  }

  const form = useForm({
    defaultValues: isEditing
      ? {
          firstName: dispatcher?.firstName || "",
          lastName: dispatcher?.lastName || "",
          teamId: dispatcher?.teamId?.toString() || ""
        }
      : { ...initialValues, ...newDispatcherData },
    validators: {
      onChange: dispatcherFormSchema
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

        // Do not auto-reset; keep values persisted until user explicitly clears
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save dispatcher:", error)
        }
      }
    }
  })

  // Persist changes in create mode with cleanup
  useEffect(() => {
    if (isEditing) return
    const unsubscribe = form.store.subscribe((state: any) => {
      if (state.values) setNewDispatcherData(state.values)
    })
    return unsubscribe
  }, [isEditing, form])

  // Snapshot latest values on unmount in create mode
  useEffect(() => {
    return () => {
      if (!isEditing) {
        const latest = (form as any)?.state?.values
        if (latest) setNewDispatcherData(latest)
      }
    }
  }, [isEditing, form])

  const resetForm = () => {
    if (!isEditing) {
      resetNewDispatcherData()
    }
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
