import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useCompanyForm } from "../hooks/useCompanyForm"
import CompanyFormFields from "./CompanyFormFields"

interface NewCompanyFormProps {
  companyId: number
}

const NewCompanyForm = ({ companyId }: NewCompanyFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { form, resetForm, isSubmitting, isEditing } = useCompanyForm({ companyId })

  const handleClearForm = () => {
    resetForm()
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Company Form Fields */}
        <CompanyFormFields form={form} />

        {/* Show validation errors */}
        {form.state.errors && form.state.errors.length > 0 && (
          <div className="text-sm text-red-500">
            {form.state.errors.map((error, index) => (
              <div key={index}>{typeof error === "string" ? error : "Validation error"}</div>
            ))}
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleClearForm}>
            Clear Form
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Company"
                  : "Create Company"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewCompanyForm
