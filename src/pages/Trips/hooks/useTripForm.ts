import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore, useTripsStore } from "@/store"
import { useCreateTripMutation, useUpdateTripMutation } from "@/hooks/trips"
import type { ITripStopResponse, ICreateTripRequest, TripStatus } from "@/types"
import { BACKEND_DATETIME_FORMAT } from "@/constants"
import dayjs from "dayjs"

// Zod validation schema - only start/end odometer optional
const tripFormSchema = z
  .object({
    truckId: z.string().min(1, "Truck is required"),
    dispatcherId: z.string().min(1, "Dispatcher is required"),
    loadNumber: z.string().min(1, "Load Number is required"),
    tripStatus: z.string().min(1, "Trip status is required"),
    startDateTime: z.string().min(1, "Start Date/Time is required"),
    endDateTime: z.string().min(1, "End Date/Time is required"),
    startOdometer: z.string().optional(),
    endOdometer: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return new Date(data.endDateTime) > new Date(data.startDateTime)
      }
      return true
    },
    {
      message: "End date/time must be after start date/time",
      path: ["endDateTime"]
    }
  )

export const useTripForm = (editMode: boolean = false) => {
  const { closeDrawer } = useDrawerStore()
  const { selectedTripId } = useTripsStore()
  const [stops, setStops] = useState<ITripStopResponse[]>([])

  const createTripMutation = useCreateTripMutation()
  const updateTripMutation = useUpdateTripMutation()

  // Format datetime for backend

  const form = useForm({
    defaultValues: {
      truckId: "",
      dispatcherId: "",
      loadNumber: "",
      tripStatus: "",
      startDateTime: "",
      endDateTime: "",
      startOdometer: "",
      endOdometer: ""
    },
    validators: {
      onChange: tripFormSchema as any
    },

    onSubmit: async ({ value }) => {
      try {
        const validatedData = tripFormSchema.parse(value)

        if (stops.length === 0) {
          alert("Please add at least one stop")
          return
        }

        const tripData: ICreateTripRequest = {
          truckId: parseInt(validatedData.truckId),
          dispatcherId: parseInt(validatedData.dispatcherId),
          loadNumber: validatedData.loadNumber,
          tripStatus: validatedData.tripStatus as TripStatus,
          startDateTime: dayjs(validatedData.startDateTime).format(BACKEND_DATETIME_FORMAT),
          endDateTime: dayjs(validatedData.endDateTime).format(BACKEND_DATETIME_FORMAT),
          startOdometer: validatedData.startOdometer ? parseFloat(validatedData.startOdometer) : (undefined as any),
          endOdometer: validatedData.endOdometer ? parseFloat(validatedData.endOdometer) : (undefined as any),
          tripStops: stops
        }

        console.log("Trip data for backend:", tripData)

        // Use appropriate mutation based on mode
        if (editMode && selectedTripId) {
          // Update existing trip
          await updateTripMutation.mutateAsync({ id: selectedTripId, data: tripData })
        } else {
          // Create new trip
          await createTripMutation.mutateAsync(tripData)
        }

        // Close drawer on success
        closeDrawer()

        // Reset form after successful operation
        resetForm()
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to create trip:", error)
        }
      }
    }
  })

  const resetForm = () => {
    form.reset()
    setStops([])
  }

  return {
    form,
    stops,
    setStops,
    resetForm,
    tripFormSchema,
    isSubmitting: editMode ? updateTripMutation.isPending : createTripMutation.isPending
  }
}
