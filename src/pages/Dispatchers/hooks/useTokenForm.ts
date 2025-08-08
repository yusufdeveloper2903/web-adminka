import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useChangeCompanyTokensMutation } from "@/hooks/companies"
import type { IDispatcherResponse } from "@/types"

// Zod validation schema
const tokenFormSchema = z.object({
  samsaraToken: z.string().min(1, "Samsara token is required"),
  gleToken: z.string().min(1, "GLE token is required")
})

interface UseTokenFormProps {
  dispatcher: IDispatcherResponse
}

export const useTokenForm = ({ dispatcher }: UseTokenFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const changeTokensMutation = useChangeCompanyTokensMutation()

  const form = useForm({
    defaultValues: {
      samsaraToken: "",
      gleToken: ""
    },
    validators: {
      onChange: tokenFormSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = tokenFormSchema.parse(value)

        console.log("Token data for backend:", validatedData)

        // Update company tokens using dispatcher's company ID
        await changeTokensMutation.mutateAsync({
          companyId: dispatcher.id, // Using dispatcher ID as company ID
          data: {
            samsaraToken: validatedData.samsaraToken,
            gleToken: validatedData.gleToken
          }
        })

        // Close drawer on success
        closeDrawer()

        // Reset form after successful update
        resetForm()
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to update tokens:", error)
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
    tokenFormSchema,
    isSubmitting: changeTokensMutation.isPending
  }
}

export default useTokenForm
