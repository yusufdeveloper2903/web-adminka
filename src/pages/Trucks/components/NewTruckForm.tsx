import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useTruckForm } from "../hooks/useTruckForm"
import TruckFormFields from "./TruckFormFields"

const NewTruckForm = () => {
  const { closeDrawer } = useDrawerStore()
  const { form, resetForm, truckFormSchema, isSubmitting } = useTruckForm()

  const handleDeleteTruck = () => {
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
        <TruckFormFields form={form} />

        {/* Bottom buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleDeleteTruck}>
            Clear Form
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Truck"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewTruckForm
