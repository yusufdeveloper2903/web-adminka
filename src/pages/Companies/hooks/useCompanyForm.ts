import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateCompanyMutation, useUpdateCompanyMutation } from "@/hooks/companies"
import type { ICompanyData, ICompanyResponse } from "@/types"

// Zod validation schema
const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  usDot: z.string().min(1, "US DOT number is required"),
  mc: z.number().nullable().optional()
})

interface UseCompanyFormProps {
  company?: ICompanyResponse
}

export const useCompanyForm = ({ company }: UseCompanyFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createCompanyMutation = useCreateCompanyMutation()
  const updateCompanyMutation = useUpdateCompanyMutation()

  const isEditing = !!company

  const form = useForm({
    defaultValues: {
      name: company?.name || "",
      email: company?.email || "",
      phone: company?.phone || "",
      usDot: company?.usDot || "",
      mc: company?.mc || null
    },
    validators: {
      onChange: companyFormSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = companyFormSchema.parse(value)

        const companyData: ICompanyData = {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          usDot: validatedData.usDot,
          mc: validatedData.mc || null
        }

        console.log("Company data for backend:", companyData)

        if (isEditing && company) {
          // Update company
          await updateCompanyMutation.mutateAsync({
            id: company.id,
            data: companyData
          })
        } else {
          // Create company
          await createCompanyMutation.mutateAsync(companyData)
        }

        // Close drawer on success
        closeDrawer()

        // Reset form after successful creation (not for editing)
        if (!isEditing) {
          resetForm()
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save company:", error)
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
    companyFormSchema,
    isSubmitting: isEditing ? updateCompanyMutation.isPending : createCompanyMutation.isPending,
    isEditing
  }
}

export default useCompanyForm
