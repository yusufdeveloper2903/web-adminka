import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateTruckMutation, useUpdateTruckMutation } from "@/hooks/trucks"
import type { ICreateTruckRequest, ITruckResponse } from "@/types"

// Zod validation schema
const truckFormSchema = z.object({
  vinNumber: z.string().min(1, "VIN Number is required"),
  unitNumber: z.string().min(1, "Unit Number is required"),
  samsaraVin: z.string().min(1, "Samsara VIN is required"),
  homeLocation: z.string().min(1, "Home Location is required"),
  licencePlate: z.string().min(1, "License Plate is required")
})

interface UseTruckFormProps {
  truck?: ITruckResponse
}

export const useTruckForm = ({ truck }: UseTruckFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createTruckMutation = useCreateTruckMutation()
  const updateTruckMutation = useUpdateTruckMutation()

  const isEditing = !!truck

  const form = useForm({
    defaultValues: {
      vinNumber: truck?.vinNumber || "",
      unitNumber: truck?.unitNumber || "",
      samsaraVin: truck?.samsaraVin || "",
      homeLocation: truck?.homeLocation || "",
      licencePlate: truck?.licencePlate || ""
    },
    validators: {
      onChange: truckFormSchema
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = truckFormSchema.parse(value)

        const truckData: ICreateTruckRequest = {
          vinNumber: validatedData.vinNumber,
          unitNumber: validatedData.unitNumber,
          samsaraVin: validatedData.samsaraVin,
          homeLocation: validatedData.homeLocation,
          licencePlate: validatedData.licencePlate
        }

        console.log("Truck data for backend:", truckData)

        if (isEditing && truck) {
          // Update truck
          await updateTruckMutation.mutateAsync({
            id: truck.id,
            data: truckData
          })
        } else {
          // Create truck
          await createTruckMutation.mutateAsync(truckData)
        }

        // Close drawer on success
        closeDrawer()

        // Reset form after successful creation (not for editing)
        if (!isEditing) {
          resetForm()
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save truck:", error)
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
    isSubmitting: isEditing ? updateTruckMutation.isPending : createTruckMutation.isPending,
    isEditing
  }
}
