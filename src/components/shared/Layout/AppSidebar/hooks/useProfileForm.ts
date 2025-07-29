import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useUpdateProfileMutation } from "@/hooks/auth"
import type { IUpdateProfileRequest, IUser } from "@/types"

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  phone: z.string().optional()
})

interface UseProfileFormProps {
  user: IUser
  onClose: () => void
}

export const useProfileForm = ({ user, onClose }: UseProfileFormProps) => {
  const updateProfileMutation = useUpdateProfileMutation()
  console.log('user', user)

  const form = useForm({
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || ""
    },
    validators: {
      onChange: profileFormSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        // The adapter handles parsing, so we can trust the value
        const payload: IUpdateProfileRequest = {
          ...value,
          phone: value.phone || ""
        }

        await updateProfileMutation.mutateAsync(payload)

        onClose()
      } catch (error) {
        // The form will handle and display Zod errors
        console.error("Failed to update profile:", error)
      }
    }
  })

  return {
    form,
    isPending: updateProfileMutation.isPending
  }
}
