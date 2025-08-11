import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import { z } from "zod"
import { useDrawerStore, useShopsStore } from "@/store"
import { useCreateShopMutation, useUpdateShopMutation } from "@/hooks/shops"
import type { IShopData, IShopResponse } from "@/types"

// Zod validation schema
const shopFormSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  location: z.string().min(1, "Location is required"),
  latitude: z.number(),
  longitude: z.number()
})

interface UseShopFormProps {
  shop?: IShopResponse
}

export const useShopForm = ({ shop }: UseShopFormProps = {}) => {
  const { closeDrawer } = useDrawerStore()
  const createShopMutation = useCreateShopMutation()
  const updateShopMutation = useUpdateShopMutation()

  const isEditing = !!shop

  const { newShopData, setNewShopData, resetNewShopData } = useShopsStore()

  const initialValues = {
    name: "",
    location: "",
    latitude: 0,
    longitude: 0
  }

  const form = useForm({
    defaultValues: isEditing
      ? {
          name: shop?.name || "",
          location: shop?.location || "",
          latitude: shop?.latitude || 0,
          longitude: shop?.longitude || 0
        }
      : { ...initialValues, ...newShopData },
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

        // Do not auto-reset; keep values persisted until user explicitly clears
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save shop:", error)
        }
      }
    }
  })

  // Persist changes in create mode
  useEffect(() => {
    if (isEditing) return
    const unsubscribe = form.store.subscribe((state: any) => {
      if (state.values) setNewShopData(state.values)
    })
    return unsubscribe
  }, [isEditing, form])

  // Snapshot on unmount
  useEffect(() => {
    return () => {
      if (!isEditing) {
        const latest = (form as any)?.state?.values
        if (latest) setNewShopData(latest)
      }
    }
  }, [isEditing, form, setNewShopData])

  const resetForm = () => {
    if (!isEditing) {
      resetNewShopData()
    }
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
