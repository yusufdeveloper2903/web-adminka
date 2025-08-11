import { Button } from "@/components/ui/button"
import { useDrawerStore, useTripsStore } from "@/store"
import { useTripForm } from "../hooks/useTripForm"
import { useStopManagement } from "../hooks/useStopManagement"
import TripFormFields from "./TripFormFields"
import { useEffect } from "react"
import { useTripByIdQuery } from "@/hooks/trips"
import type { TripStatus } from "@/types"

interface NewRouteFormProps {
  editMode?: boolean
}

const NewRouteForm = ({ editMode = false }: NewRouteFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { selectedTripId } = useTripsStore()

  const { form, stops, setStops, resetForm, tripFormSchema, isSubmitting } = useTripForm(editMode)
  const { data: tripData } = useTripByIdQuery(selectedTripId!, !!selectedTripId)

  const {
    newStopForm,
    setNewStopForm,
    handleLocationSelect,
    handleAddStop,
    handleRemoveStop,
    handleStopUpdate,
    handleReorderStops,
    resetStopForm,
    isCalculatingRoute
  } = useStopManagement(stops, setStops, editMode)

  // Populate form with tripData when in edit mode
  useEffect(() => {
    if (editMode && tripData) {
      // Populate form fields
      form.setFieldValue("truckId", tripData.truck.id.toString())
      form.setFieldValue("dispatcherId", tripData.dispatcher.id.toString())
      form.setFieldValue("loadNumber", tripData.loadNumber)
      form.setFieldValue("tripStatus", tripData.tripStatus as TripStatus)
      form.setFieldValue("startDateTime", tripData.startDateTime)
      form.setFieldValue("endDateTime", tripData.endDateTime)
      form.setFieldValue("startOdometer", tripData.startOdometer?.toString() || "")
      form.setFieldValue("endOdometer", tripData.endOdometer?.toString() || "")

      // Populate stops
      if (tripData.tripStops && tripData.tripStops.length > 0) {
        console.log(
          "📥 Loading trip stops from backend:",
          tripData.tripStops.map((s) => ({
            address: s.address,
            distance: s.distance,
            totalDistance: s.totalDistance,
            duration: s.duration
          }))
        )
        setStops(tripData.tripStops)
      }
    }
  }, [editMode, tripData, form, setStops])

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
        className="space-y-4"
      >
        <TripFormFields
          form={form}
          tripFormSchema={tripFormSchema}
          stops={stops}
          onRemoveStop={handleRemoveStop}
          onStopUpdate={handleStopUpdate}
          onReorderStops={handleReorderStops}
          newStopForm={newStopForm}
          setNewStopForm={setNewStopForm}
          onLocationSelect={handleLocationSelect}
          onAddStop={handleAddStop}
          isCalculatingRoute={isCalculatingRoute}
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
              {isSubmitting ? (editMode ? "Updating..." : "Creating...") : editMode ? "Update Trip" : "Create Trip"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewRouteForm
