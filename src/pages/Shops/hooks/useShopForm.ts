import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useDrawerStore } from "@/store"
import { useCreateShopMutation, useUpdateShopMutation } from "@/hooks/shops"
import type { IShopData, IShopResponse } from "@/types"

// Zod validation schema
const shopFormSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180")
})

interface UseShopFormProps {
  shop?: IShopResponse
}

export const useShopForm = ({ shop }: UseShopFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createShopMutation = useCreateShopMutation()
  const updateShopMutation = useUpdateShopMutation()

  const isEditing = !!shop

  const form = useForm({
    defaultValues: {
      name: shop?.name || "",
      location: shop?.location || "",
      latitude: shop?.latitude || 0,
      longitude: shop?.longitude || 0
    },
    validators: {
      onChange: shopFormSchema
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = shopFormSchema.parse(value)

        const shopData: IShopData = {
          name: validatedData.name,
          location: validatedData.location,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude
        }

        console.log("Shop data for backend:", shopData)

        if (isEditing && shop) {
          // Update shop
          await updateShopMutation.mutateAsync({
            id: shop.id,
            data: shopData
          })
        } else {
          // Create shop
          await createShopMutation.mutateAsync(shopData)
        }

        // Close drawer on success
        closeDrawer()

        // Reset form after successful creation
        if (!isEditing) {
          resetForm()
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save shop:", error)
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
    shopFormSchema,
    isSubmitting: isEditing ? updateShopMutation.isPending : createShopMutation.isPending,
    isEditing
  }
}

export default useShopForm