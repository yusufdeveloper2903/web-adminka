import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useTripForm } from "../hooks/useTripForm"
import { useStopManagement } from "../hooks/useStopManagement"
import TripFormFields from "./TripFormFields"
import AddStopForm from "./AddStopForm"

const NewRouteForm = () => {
  const { closeDrawer } = useDrawerStore()
  const { form, stops, setStops, resetForm, tripFormSchema, isSubmitting } = useTripForm()

  const {
    newStopForm,
    setNewStopForm,
    handleLocationSelect,
    handleAddStop,
    handleRemoveStop,
    handleStopUpdate,
    resetStopForm,
    formatDistance,
    formatDuration
  } = useStopManagement(stops, setStops)

  const handleDeleteTrip = () => {
    resetForm()
    resetStopForm()
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
        <TripFormFields
          form={form}
          tripFormSchema={tripFormSchema}
          stops={stops}
          onRemoveStop={handleRemoveStop}
          onStopUpdate={handleStopUpdate}
          formatDistance={formatDistance}
          formatDuration={formatDuration}
          newStopForm={newStopForm}
          setNewStopForm={setNewStopForm}
          onLocationSelect={handleLocationSelect}
          onAddStop={handleAddStop}
        />

        {/* Show validation errors */}
        {form.state.errors && form.state.errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-500">
            <h4 className="mb-2 font-medium">Please fix the following errors:</h4>
            {form.state.errors.map((error, index) => (
              <div key={index}>• {typeof error === "string" ? error : "Validation error"}</div>
            ))}
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex justify-between border-t pt-4">
          <Button type="button" variant="destructive" onClick={handleDeleteTrip}>
            Clear Form
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || stops.length === 0}>
              {isSubmitting ? "Creating..." : "Create Trip"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewRouteForm
