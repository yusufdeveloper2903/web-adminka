import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore, useRouteStore, useTripsViewStore } from "@/store"
import type { TripCreateDto, TripStopCreateDto } from "@/types"
import dayjs from "dayjs"

// Zod validation schema
const tripFormSchema = z
  .object({
    truckId: z.string().min(1, "Please select a truck"),
    dispatcherId: z.string().min(1, "Please select a dispatcher"),
    loadNumber: z.string().min(1, "Load number is required"),
    startDateTime: z.string().min(1, "Start date/time is required"),
    endDateTime: z.string().min(1, "End date/time is required"),
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

export const useTripForm = () => {
  const { closeDrawer } = useDrawerStore()
  const { setRoute, clearRoute } = useRouteStore()
  const { setView } = useTripsViewStore()
  const [stops, setStops] = useState<TripStopCreateDto[]>([])

  // Format datetime for backend
  const formatDateTime = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return ""
    return dayjs(dateTimeLocal).format("YYYY-MM-DD HH:mm:ss")
  }

  const form = useForm({
    defaultValues: {
      truckId: "",
      dispatcherId: "",
      loadNumber: "",
      startDateTime: "",
      endDateTime: "",
      startOdometer: "",
      endOdometer: ""
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = tripFormSchema.parse(value)

        if (stops.length === 0) {
          alert("Please add at least one stop")
          return
        }

        const tripData: TripCreateDto = {
          truckId: parseInt(validatedData.truckId),
          dispatcherId: parseInt(validatedData.dispatcherId),
          loadNumber: validatedData.loadNumber,
          startDateTime: formatDateTime(validatedData.startDateTime),
          endDateTime: formatDateTime(validatedData.endDateTime),
          startOdometer: validatedData.startOdometer ? parseFloat(validatedData.startOdometer) : 0,
          endOdometer: validatedData.endOdometer ? parseFloat(validatedData.endOdometer) : 0,
          tripStops: stops
        }

        console.log("Trip data for backend:", tripData)
        
        // Clear any existing route first to prevent overlap
        clearRoute()
        
        // Small delay to ensure clearing is complete, then set new route
        setTimeout(() => {
          setRoute(tripData)
        }, 100)

        // Switch to map view to show the route
        setView("map")

        // TODO: Send to backend API
        // await createTrip(tripData)

        closeDrawer()
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
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
    tripFormSchema
  }
}
