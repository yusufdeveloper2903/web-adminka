import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useDrawerStore, useStaffsStore } from "@/store"
import { useCreateStaffMutation, useUpdateStaffMutation } from "@/hooks"
import type { IUserResponse } from "@/types"
import type { IStaffCreateRequest } from "@/types/staffs"

// Zod validation schema
const staffFormSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(150, "Max 150 characters")
    .regex(/^[\w.@+-]+$/, "Only letters, digits and @/./+/-/_ allowed"),
  first_name: z.string().min(1, "First name is required"),
  sur_name: z.string().min(1, "Surname is required"),
  mid_name: z.string().min(1, "Mid name is required")
})

interface UseStaffsFormProps {
  user?: IUserResponse
}

export const useStaffsForm = ({ user }: UseStaffsFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createStaffMutation = useCreateStaffMutation()
  const updateStaffMutation = useUpdateStaffMutation()

  const isEditing = !!user

  const { newUserData, setNewUserData, resetNewUserData } = useStaffsStore()

  const initialValues = {
    username: "",
    first_name: "",
    sur_name: "",
    mid_name: ""
  }

  const form = useForm({
    defaultValues: isEditing
      ? {
          username: (user as any)?.username || "",
          first_name: (user as any)?.first_name || (user as any)?.firstName || "",
          sur_name: (user as any)?.sur_name || (user as any)?.lastName || "",
          mid_name: (user as any)?.mid_name || ""
        }
      : { ...initialValues, ...(newUserData as any) },
    validators: {
      onChange: staffFormSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = staffFormSchema.parse(value) as IStaffCreateRequest

        if (isEditing) {
          await updateStaffMutation.mutateAsync({ id: (user as any)?.id, data: validatedData })
          closeDrawer()
        } else {
          await createStaffMutation.mutateAsync(validatedData)
          // Close drawer on success
          closeDrawer()
          // After successful creation, reset to initial values and clear persisted store
          resetForm()
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save staff:", error)
        }
      }
    }
  })

  // Persist changes in create mode
  useEffect(() => {
    if (isEditing) return
    const unsubscribe = form.store.subscribe((state: any) => {
      if (state.values) setNewUserData(state.values)
    })
    return unsubscribe
  }, [isEditing, form, setNewUserData])

  // Snapshot on unmount
  useEffect(() => {
    return () => {
      if (!isEditing) {
        const latest = (form as any)?.state?.values
        if (latest) setNewUserData(latest)
      }
    }
  }, [isEditing, form, setNewUserData])

  const resetForm = () => {
    if (!isEditing) {
      resetNewUserData()
    }
    form.reset()
  }

  return {
    form,
    resetForm,
    staffFormSchema,
    isSubmitting: isEditing ? updateStaffMutation.isPending : createStaffMutation.isPending,
    isEditing
  }
}

export default useStaffsForm
