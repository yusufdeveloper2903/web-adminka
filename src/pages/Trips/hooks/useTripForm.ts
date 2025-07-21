import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore, useRouteStore, useTripsViewStore } from "@/store"
import type { TripCreateDto, TripStopCreateDto } from "@/types"
import dayjs from "dayjs"

// Zod validation schema - all fields optional for testing
const tripFormSchema = z
  .object({
    truckId: z.string().optional(),
    dispatcherId: z.string().optional(),
    loadNumber: z.string().optional(),
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

export const useTripForm = () => {
  const { closeDrawer } = useDrawerStore()
  const { setRoute, clearRoute, setCalculatingRoute } = useRouteStore()
  const { setView } = useTripsViewStore()
  const [stops, setStops] = useState<TripStopCreateDto[]>([])

  // Format datetime for backend
  const formatDateTime = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return ""
    return dayjs(dateTimeLocal).format("YYYY-MM-DD HH:mm:ss")
  }

  const form = useForm({
    defaultValues: {
      truckId: "626", // Default truck
      dispatcherId: "1", // Default dispatcher
      loadNumber: "TEST-" + Date.now().toString().slice(-6), // Auto-generated load number
      startDateTime: dayjs().format("YYYY-MM-DDTHH:mm"), // Current time
      endDateTime: dayjs().add(8, "hours").format("YYYY-MM-DDTHH:mm"), // 8 hours later
      startOdometer: "100000",
      endOdometer: "100500"
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = tripFormSchema.parse(value)

        if (stops.length === 0) {
          alert("Please add at least one stop")
          return
        }

        const tripData: TripCreateDto = {
          truckId: validatedData.truckId ? parseInt(validatedData.truckId) : 626,
          dispatcherId: validatedData.dispatcherId ? parseInt(validatedData.dispatcherId) : 1,
          loadNumber: validatedData.loadNumber || "TEST-" + Date.now().toString().slice(-6),
          startDateTime: formatDateTime(validatedData.startDateTime || dayjs().format("YYYY-MM-DDTHH:mm")),
          endDateTime: formatDateTime(validatedData.endDateTime || dayjs().add(8, "hours").format("YYYY-MM-DDTHH:mm")),
          startOdometer: validatedData.startOdometer ? parseFloat(validatedData.startOdometer) : 100000,
          endOdometer: validatedData.endOdometer ? parseFloat(validatedData.endOdometer) : 100500,
          tripStops: stops
        }

        console.log("Trip data for backend:", tripData)

        // Clear any existing route first to prevent overlap
        clearRoute()

        // Switch to map view immediately for better UX
        setView("map")

        // Start loading state for route calculation
        setCalculatingRoute(true)

        // Small delay to ensure clearing is complete, then set new route
        setTimeout(() => {
          setRoute(tripData)
        }, 150)

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
