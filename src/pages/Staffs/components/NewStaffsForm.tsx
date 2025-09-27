import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useStaffsForm } from "../hooks/useStaffsForm"
import StaffsFormFields from "./StaffsFormFields"
// No props for now

const NewStaffsForm = () => {
  const { closeDrawer } = useDrawerStore()
  // For now we only support creating staffs via POST /staffs/staffs/
  const { form, resetForm, isSubmitting } = useStaffsForm()

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
        {/* Staff Form Fields */}
        <StaffsFormFields form={form} />

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
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Staff"}</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewStaffsForm
