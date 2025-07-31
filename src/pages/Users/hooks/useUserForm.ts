import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
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

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "OWNER"
    },
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

        // Reset form after successful creation
        if (!isEditing) {
          resetForm()
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save user:", error)
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
    userFormSchema,
    isSubmitting: isEditing ? updateUserMutation.isPending : createUserMutation.isPending,
    isEditing
  }
}

export default useUserForm
