import { useState, useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore, useTripsStore } from "@/store"
import { useCreateTripMutation, useUpdateTripMutation } from "@/hooks/trips"
import type { ITripStopResponse, TripStatus, IdentifierType } from "@/types"
import { BACKEND_DATETIME_FORMAT } from "@/constants"
import dayjs from "dayjs"
import { cleanObject } from "@/lib"

// Zod validation schema with conditional date/time validation
const tripFormSchema = z
  .object({
    truckId: z.string().min(1, "Truck is required"),
    driverId: z.string().min(1, "Driver is required"),
    dispatcherId: z.string().optional(),
    identifierType: z.string().min(1, "Identifier type is required"),
    identifierValue: z.string().min(1, "Number is required"),
    tripStatus: z.string().min(1, "Trip status is required"),
    startDateTime: z.string().optional(),
    endDateTime: z.string().optional(),
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

const initialFormValues = {
  truckId: "",
  driverId: "",
  dispatcherId: "",
  identifierType: "LOAD_NUMBER" as IdentifierType,
  identifierValue: "",
  tripStatus: "UPCOMING" as TripStatus,
  startDateTime: "",
  endDateTime: "",
  startOdometer: "",
  endOdometer: ""
}

export const useTripForm = (editMode: boolean = false) => {
  const { closeDrawer } = useDrawerStore()
  const {
    selectedTripId,
    newTripData,
    setNewTripData,
    resetNewTripData,
    newTripStops,
    setNewTripStops,
    resetNewTripStops
  } = useTripsStore()
  // Initialize stops from store only in non-edit mode
  const [stops, setStops] = useState<ITripStopResponse[]>(!editMode ? newTripStops : [])

  const createTripMutation = useCreateTripMutation()
  const updateTripMutation = useUpdateTripMutation()

  // Format datetime for backend

  const form = useForm({
    defaultValues: !editMode ? { ...initialFormValues, ...newTripData } : initialFormValues,
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

        // Filter tripStops to match backend DTO (remove extra fields)
        const filteredStops = stops.map((stop) =>
          cleanObject({
            id: stop.id || null,
            address: stop.address,
            distance: stop.distance,
            totalDistance: stop.totalDistance,
            duration: stop.duration,
            loadStatus: stop.loadStatus,
            orderIndex: stop.orderIndex,
            latitude: stop.latitude,
            longitude: stop.longitude,
            stopType: stop.stopType
          })
        )

        // Build tripData object conditionally
        const tripData: any = {
          truckId: parseInt(validatedData.truckId),
          dispatcherId: parseInt(validatedData.dispatcherId as string),
          identifierType: validatedData.identifierType as IdentifierType,
          identifierValue: validatedData.identifierValue,
          tripStatus: validatedData.tripStatus as TripStatus,
          tripStops: filteredStops
        }

        // Include driverId only if provided
        if (validatedData.driverId && validatedData.driverId.trim() !== "") {
          tripData.driverId = parseInt(validatedData.driverId)
        }
        

        // Only add datetime fields if they have valid values
        if (validatedData.startDateTime && validatedData.startDateTime.trim() !== "") {
          // validatedData.startDateTime is already UTC (converted in TripFormFields via centralStringToUTC)
          // Format it as UTC for backend without shifting to local timezone
          tripData.startDateTime = dayjs.utc(validatedData.startDateTime).format(BACKEND_DATETIME_FORMAT)
        }

        if (validatedData.endDateTime && validatedData.endDateTime.trim() !== "") {
          tripData.endDateTime = dayjs.utc(validatedData.endDateTime).format(BACKEND_DATETIME_FORMAT)
        }

        // Only add odometer fields if they have values
        if (validatedData.startOdometer && validatedData.startOdometer.trim() !== "") {
          tripData.startOdometer = parseFloat(validatedData.startOdometer)
        }

        if (validatedData.endOdometer && validatedData.endOdometer.trim() !== "") {
          tripData.endOdometer = parseFloat(validatedData.endOdometer)
        }

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
        // After successful creation, reset to initial values and clear persisted store
        if (!editMode) {
          resetNewTripData()
          resetNewTripStops()
          form.reset()
          setStops([])
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to create trip:", error)
        }
      }
    }
  })

  // Subscribe to form changes and update the store only when not in edit mode
  useEffect(() => {
    if (!editMode) {
      const unsubscribe = form.store.subscribe((state: any) => {
        if (state.values) {
          setNewTripData(state.values)
        }
      })
      return unsubscribe
    }
  }, [form, setNewTripData, editMode])

  // Sync stops to store only in non-edit mode
  useEffect(() => {
    if (!editMode) {
      setNewTripStops(stops)
    }
  }, [stops, editMode, setNewTripStops])

  // On unmount, snapshot the latest values to store (for safety)
  useEffect(() => {
    return () => {
      if (!editMode) {
        try {
          const latest = (form as any)?.state?.values
          if (latest) setNewTripData(latest)
          if (stops) setNewTripStops(stops)
        } catch {
          // no-op
        }
      }
    }
  }, [editMode, form, setNewTripData, setNewTripStops, stops])

  const resetForm = () => {
    // When resetting, also clear the persisted state in the store
    if (!editMode) {
      resetNewTripData()
      resetNewTripStops()
    }
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
