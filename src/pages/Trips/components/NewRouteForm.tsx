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
        {/* 1. Truck, Load Number, Dispatcher section (border bilan) */}
        {/* 2. Add Stop (bordersiz, "City" label bilan) */}
        {/* 3. Stops Table section (border bilan) */}
        {/* 4. Date/Time va Odometer section (border bilan) */}
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
          <div className="text-red-500 text-sm border border-red-200 rounded-lg p-3 bg-red-50">
            <h4 className="font-medium mb-2">Please fix the following errors:</h4>
            {form.state.errors.map((error, index) => (
              <div key={index}>
                • {typeof error === 'string' ? error : 'Validation error'}
              </div>
            ))}
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex justify-between pt-4 border-t">
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