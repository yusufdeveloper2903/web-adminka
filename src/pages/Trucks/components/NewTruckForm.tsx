import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useTruckForm } from "../hooks/useTruckForm"
import TruckFormFields from "./TruckFormFields"
import type { ITruckResponse } from "@/types"

interface NewTruckFormProps {
  truck?: ITruckResponse
  isViewMode?: boolean
}

const NewTruckForm = ({ truck, isViewMode = false }: NewTruckFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { form, resetForm, isSubmitting, isEditing } = useTruckForm({ truck })

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
        {/* Truck Form Fields */}
        <TruckFormFields form={form} truck={truck} isViewMode={isViewMode} />

        {/* Show validation errors */}
        {form.state.errors && form.state.errors.length > 0 && (
          <div className="text-sm text-red-500">
            {form.state.errors.map((error, index) => (
              <div key={index}>{typeof error === "string" ? error : "Validation error"}</div>
            ))}
          </div>
        )}

        {/* Bottom buttons */}
        {!isViewMode && (
          <div className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleClearForm}>
              Clear Form
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeDrawer}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Submit" : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default NewTruckForm
