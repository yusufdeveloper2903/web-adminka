import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useTripForm } from "../hooks/useTripForm"
import { useStopManagement } from "../hooks/useStopManagement"
import TripFormFields from "./TripFormFields"
import AddStopForm from "./AddStopForm"
import StopsTable from "./StopsTable"

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
        {/* Trip Form Fields */}
        <TripFormFields form={form} tripFormSchema={tripFormSchema} />

        {/* Add Stop Form */}
        <AddStopForm
          newStopForm={newStopForm}
          setNewStopForm={setNewStopForm}
          onLocationSelect={handleLocationSelect}
          onAddStop={handleAddStop}
        />

        {/* Stops Table */}
        <StopsTable
          stops={stops}
          onRemoveStop={handleRemoveStop}
          onStopUpdate={handleStopUpdate}
          formatDistance={formatDistance}
          formatDuration={formatDuration}
        />

        {/* Bottom buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleDeleteTrip}>
            Delete Trip
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || stops.length === 0}>
              {isSubmitting ? "Creating..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewRouteForm
