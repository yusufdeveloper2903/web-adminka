import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useChangeCompanyTokensMutation } from "@/hooks/companies"
import { useCompanyByIdQuery } from "@/hooks/companies/queries/useCompanyByIdQuery"

// Zod validation schema
const tokenFormSchema = z.object({
  samsaraToken: z.string().min(1, "Samsara token is required"),
  gleToken: z.string().min(1, "GLE token is required")
})

interface UseTokenFormProps {
  companyId: number
}

export const useTokenForm = ({ companyId }: UseTokenFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const changeTokensMutation = useChangeCompanyTokensMutation()
  const { data: company, isLoading, isError } = useCompanyByIdQuery(companyId)

  const form = useForm({
    defaultValues: {
      samsaraToken: company?.samsaraToken || "",
      gleToken: company?.gleToken || ""
    },
    validators: {
      onChange: tokenFormSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = tokenFormSchema.parse(value)

        // Update company tokens
        if (!company) return
        await changeTokensMutation.mutateAsync({
          companyId: company.id,
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
    isSubmitting: changeTokensMutation.isPending,
    isLoading,
    isError
  }
}

export default useTokenForm
