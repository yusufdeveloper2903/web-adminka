import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useUpdateTruckMutation } from "@/hooks/trucks"
import type { ICreateTruckRequest, ITruckResponse } from "@/types"

// Zod validation schema
const truckFormSchema = z.object({
  vinNumber: z.string().min(1, "VIN Number is required"),
  unitNumber: z.string().min(1, "Unit Number is required"),
  samsaraVin: z.string().min(1, "Samsara VIN is required"),
  homeLocation: z.string().min(1, "Home Location is required"),
  licencePlate: z.string().min(1, "License Plate is required"),
  homeLatitude: z.number().nullable(),
  homeLongitude: z.number().nullable()
})

interface UseTruckFormProps {
  truck?: ITruckResponse
}

export const useTruckForm = ({ truck }: UseTruckFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const updateTruckMutation = useUpdateTruckMutation()

  const isEditing = !!truck

  const form = useForm({
    defaultValues: {
      vinNumber: truck?.vinNumber || "",
      unitNumber: truck?.unitNumber || "",
      samsaraVin: truck?.samsaraVin || "",
      homeLocation: truck?.homeLocation || "",
      licencePlate: truck?.licencePlate || "",
      homeLatitude: truck?.homeLatitude ?? null,
      homeLongitude: truck?.homeLongitude ?? null
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
          licencePlate: validatedData.licencePlate,
          homeLatitude: validatedData.homeLatitude || undefined,
          homeLongitude: validatedData.homeLongitude || undefined
        }

        if (isEditing && truck) {
          // Update truck
          await updateTruckMutation.mutateAsync({
            id: truck.id,
            data: truckData
          })
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
    isSubmitting: updateTruckMutation.isPending,
    isEditing
  }
}
