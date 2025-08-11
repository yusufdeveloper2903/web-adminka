import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useDrawerStore, useUsersStore } from "@/store"
import { useCreateUserMutation, useUpdateUserMutation } from "@/hooks/users"
import type { IUserData, IUserResponse } from "@/types"

// Zod validation schema
const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  role: z.enum(["OWNER", "MANAGER", "USER"])
})

interface UseUserFormProps {
  user?: IUserResponse
}

export const useUserForm = ({ user }: UseUserFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createUserMutation = useCreateUserMutation()
  const updateUserMutation = useUpdateUserMutation()

  const isEditing = !!user

  const { newUserData, setNewUserData, resetNewUserData } = useUsersStore()

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "OWNER" as const
  }

  const form = useForm({
    defaultValues: isEditing
      ? {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          role: (user?.role as any) || "OWNER"
        }
      : { ...initialValues, ...newUserData },
    validators: {
      onChange: userFormSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = userFormSchema.parse(value)

        const userData: IUserData = {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone || "",
          role: validatedData.role
        }

        if (isEditing && user) {
          // Update user
          await updateUserMutation.mutateAsync({
            id: user.id,
            data: userData
          })
        } else {
          // Create user
          await createUserMutation.mutateAsync(userData)
        }

        // Close drawer on success
        closeDrawer()

        // Do not auto-reset; keep values persisted until user explicitly clears
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save user:", error)
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
  }, [isEditing, form])

  // Snapshot on unmount
  useEffect(() => {
    return () => {
      if (!isEditing) {
        const latest = (form as any)?.state?.values
        if (latest) setNewUserData(latest)
      }
    }
  }, [isEditing, form])

  const resetForm = () => {
    if (!isEditing) {
      resetNewUserData()
    }
    form.reset()
  }

  return {
    form,
    resetForm,
    userFormSchema,
    isSubmitting: isEditing ? updateUserMutation.isPending : createUserMutation.isPending,
    isEditing
  }
}

export default useUserForm
