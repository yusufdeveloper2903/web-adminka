import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useGlobalSettingByType } from "@/hooks/global-setting"
import { useCreateGlobalSettingMutation, useUpdateGlobalSettingMutation } from "@/hooks/global-setting"
import { useEffect } from "react"
import type { ICreateGlobalSettingRequest } from "@/types"

// Zod validation schema
const systemFormSchema = z.object({
  homeRadius: z.number().min(0, "Home radius must be positive"),
  shopRadius: z.number().min(0, "Shop radius must be positive"),
  pickupRadius: z.number().min(0, "Pickup radius must be positive"),
  trailerRadius: z.number().min(0, "Trailer radius must be positive"),
  deliveryRadius: z.number().min(0, "Delivery radius must be positive"),
  samsaraEnabled: z.boolean(),
  gleEnabled: z.boolean()
})

export const useSystemForm = () => {
  // Fetch existing settings
  const { data: globalSettings, isLoading } = useGlobalSettingByType("TRIP")

  // Mutations
  const createMutation = useCreateGlobalSettingMutation()
  const updateMutation = useUpdateGlobalSettingMutation()

  const isEditing = !!globalSettings
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm({
    defaultValues: {
      homeRadius: 0,
      shopRadius: 0,
      pickupRadius: 0,
      trailerRadius: 0,
      deliveryRadius: 0,
      samsaraEnabled: false,
      gleEnabled: false
    },
    validators: {
      onChange: systemFormSchema as any
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = systemFormSchema.parse(value)

        const settingsData: ICreateGlobalSettingRequest = {
          homeRadius: validatedData.homeRadius,
          shopRadius: validatedData.shopRadius,
          pickupRadius: validatedData.pickupRadius,
          trailerRadius: validatedData.trailerRadius,
          deliveryRadius: validatedData.deliveryRadius,
          samsaraEnabled: validatedData.samsaraEnabled,
          gleEnabled: validatedData.gleEnabled,
          type: "TRIP"
        }

        if (isEditing && globalSettings) {
          // Update existing settings - don't include id in payload
          await updateMutation.mutateAsync({
            id: globalSettings.id,
            data: settingsData
          })
        } else {
          // Create new settings
          await createMutation.mutateAsync(settingsData)
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.errors)
        } else {
          console.error("Failed to save settings:", error)
        }
      }
    }
  })

  // Update form values when data is loaded
  useEffect(() => {
    if (globalSettings) {
      form.setFieldValue("homeRadius", globalSettings.homeRadius)
      form.setFieldValue("shopRadius", globalSettings.shopRadius)
      form.setFieldValue("pickupRadius", globalSettings.pickupRadius)
      form.setFieldValue("trailerRadius", globalSettings.trailerRadius)
      form.setFieldValue("deliveryRadius", globalSettings.deliveryRadius)
      form.setFieldValue("samsaraEnabled", globalSettings.samsaraEnabled)
      form.setFieldValue("gleEnabled", globalSettings.gleEnabled)
    }
  }, [globalSettings, form])

  const resetForm = () => {
    if (globalSettings) {
      form.setFieldValue("homeRadius", globalSettings.homeRadius)
      form.setFieldValue("shopRadius", globalSettings.shopRadius)
      form.setFieldValue("pickupRadius", globalSettings.pickupRadius)
      form.setFieldValue("trailerRadius", globalSettings.trailerRadius)
      form.setFieldValue("deliveryRadius", globalSettings.deliveryRadius)
      form.setFieldValue("samsaraEnabled", globalSettings.samsaraEnabled)
      form.setFieldValue("gleEnabled", globalSettings.gleEnabled)
    } else {
      form.reset()
    }
  }

  return {
    form,
    resetForm,
    systemFormSchema,
    isSubmitting,
    isEditing,
    isLoading
  }
}

export default useSystemForm
