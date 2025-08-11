import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateCompanyMutation, useUpdateCompanyMutation } from "@/hooks/companies"
import type { ICompanyData } from "@/types"
import { useCompanyByIdQuery } from "@/hooks/companies/queries/useCompanyByIdQuery"

// Zod validation schema
const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  usDot: z.string().min(1, "US DOT number is required")
})

interface UseCompanyFormProps {
  companyId?: number
}

export const useCompanyForm = ({ companyId }: UseCompanyFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createCompanyMutation = useCreateCompanyMutation()
  const updateCompanyMutation = useUpdateCompanyMutation()

  const isEditing = !!companyId
  const { data: company } = useCompanyByIdQuery(companyId as number, isEditing)

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      usDot: ""
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
          usDot: validatedData.usDot
        }

        if (isEditing && companyId) {
          // Update company
          await updateCompanyMutation.mutateAsync({
            id: companyId,
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

  // Hydrate form when company data is fetched in edit mode
  useEffect(() => {
    if (isEditing && company) {
      form.setFieldValue("name", company.name || "")
      form.setFieldValue("email", company.email || "")
      form.setFieldValue("phone", company.phone || "")
      form.setFieldValue("usDot", company.usDot || "")
    }
  }, [isEditing, company, form])

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
