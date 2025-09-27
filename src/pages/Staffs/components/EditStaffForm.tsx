import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useStaffsForm } from "../hooks/useStaffsForm"
import StaffsFormFields from "./StaffsFormFields"
import { useStaffByIdQuery } from "@/hooks"

interface EditStaffFormProps {
  id: number
}

const EditStaffForm = ({ id }: EditStaffFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { data, isLoading } = useStaffByIdQuery(id, !!id)

  const { form, isSubmitting } = useStaffsForm({ user: data as any })

  if (isLoading) {
    return <div>Loading...</div>
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
        <StaffsFormFields form={form} />

        {form.state.errors && form.state.errors.length > 0 && (
          <div className="text-sm text-red-500">
            {form.state.errors.map((error, index) => (
              <div key={index}>{typeof error === "string" ? error : "Validation error"}</div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={closeDrawer}>
            Close
          </Button>
          <Button type="submit" className="ml-2" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditStaffForm


