import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateTripMutation } from "@/hooks/trips"
import type { ITripStopResponse, ICreateTripRequest } from "@/types"
import { INPUT_DATETIME_LOCAL_FORMAT, BACKEND_DATETIME_FORMAT, DEFAULT_WORK_HOURS } from "@/constants"
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
  const createTripMutation = useCreateTripMutation()
  const [stops, setStops] = useState<ITripStopResponse[]>([])

  // Format datetime for backend

  const form = useForm({
    defaultValues: {
      truckId: "626", // Default truck
      dispatcherId: "1", // Default dispatcher
      loadNumber: "TEST-" + Date.now().toString().slice(-6), // Auto-generated load number
      startDateTime: dayjs().format(INPUT_DATETIME_LOCAL_FORMAT), // Current time
      endDateTime: dayjs().add(DEFAULT_WORK_HOURS, "hours").format(INPUT_DATETIME_LOCAL_FORMAT), // 8 hours later
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

        const tripData: ICreateTripRequest = {
          truckId: validatedData.truckId ? parseInt(validatedData.truckId) : 626,
          dispatcherId: validatedData.dispatcherId ? parseInt(validatedData.dispatcherId) : 1,
          loadNumber: validatedData.loadNumber || "TEST-" + Date.now().toString().slice(-6),
          startDateTime: dayjs(validatedData.startDateTime).format(BACKEND_DATETIME_FORMAT),
          endDateTime: dayjs(validatedData.endDateTime).format(BACKEND_DATETIME_FORMAT),
          startOdometer: validatedData.startOdometer ? parseFloat(validatedData.startOdometer) : 100000,
          endOdometer: validatedData.endOdometer ? parseFloat(validatedData.endOdometer) : 100500,
          tripStops: stops
        }

        console.log("Trip data for backend:", tripData)

        // Create trip using mutation
        await createTripMutation.mutateAsync(tripData)

        // Close drawer on success
        closeDrawer()

        // Reset form after successful creation
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
    isSubmitting: createTripMutation.isPending
  }
}
