import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateTruckMutation } from "@/hooks/trucks"
import type { ICreateTruckRequest } from "@/types"

// Zod validation schema
const truckFormSchema = z.object({
  vinNumber: z.string().min(1, "VIN Number is required"),
  unitNumber: z.string().min(1, "Unit Number is required"),
  samsaraVin: z.string().min(1, "Samsara VIN is required"),
  homeLocation: z.string().min(1, "Home Location is required"),
  homeLatitude: z.string().min(1, "Home Latitude is required"),
  homeLongitude: z.string().min(1, "Home Longitude is required"),
  licencePlate: z.string().min(1, "License Plate is required"),
  dispatcherId: z.string().min(1, "Dispatcher is required")
})

export const useTruckForm = () => {
  const { closeDrawer } = useDrawerStore()
  const createTruckMutation = useCreateTruckMutation()

  const form = useForm({
    defaultValues: {
      vinNumber: "",
      unitNumber: "",
      samsaraVin: "",
      homeLocation: "",
      homeLatitude: "",
      homeLongitude: "",
      licencePlate: "",
      dispatcherId: ""
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = truckFormSchema.parse(value)

        const truckData: ICreateTruckRequest = {
          vinNumber: validatedData.vinNumber,
          unitNumber: validatedData.unitNumber,
          samsaraVin: validatedData.samsaraVin,
          homeLocation: validatedData.homeLocation,
          homeLatitude: parseFloat(validatedData.homeLatitude),
          homeLongitude: parseFloat(validatedData.homeLongitude),
          licencePlate: validatedData.licencePlate
        }

        console.log("Truck data for backend:", truckData)

        // Create truck using mutation
        await createTruckMutation.mutateAsync(truckData)

        // Close drawer on success
        closeDrawer()

        // Reset form after successful creation
        resetForm()
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to create truck:", error)
        }
      }
    }
  })

  const resetForm = () => {
    form.reset()
  }

  return {
    form,
    resetForm,
    truckFormSchema,
    isSubmitting: createTruckMutation.isPending
  }
}
