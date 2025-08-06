import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SettingsIcon } from "lucide-react"
import { useRouteStore } from "@/store"
import { useMeQuery } from "@/hooks/auth"
import { useUserRouteSettingById } from "@/hooks/user-route-setting/queries/useUserRouteSettingById"
import { useCreateUserRouteSettingMutation } from "@/hooks/user-route-setting/mutations/useCreateUserRouteSettingMutation"
import { useUpdateUserRouteSettingMutation } from "@/hooks/user-route-setting/mutations/useUpdateUserRouteSettingMutation"
import { useEffect } from "react"
import type { ICreateUserRouteSettingRequest, IUpdateUserRouteSettingRequest } from "@/types"
import { cleanObject } from "@/lib/utils"

export const RouteSettingsPopover = () => {
  const { routeSettings, updateRouteSettings } = useRouteStore()

  // Get current user
  const { data: currentUser } = useMeQuery()

  // Get user route settings
  const { data: userRouteSettings, error: fetchError } = useUserRouteSettingById(
    currentUser?.id || 0,
    !!currentUser?.id
  )

  // Mutations
  const createMutation = useCreateUserRouteSettingMutation()
  const updateMutation = useUpdateUserRouteSettingMutation()

  const isEditing = !!userRouteSettings
  const is404Error = fetchError && (fetchError as any)?.response?.status === 404

  // Update local store when API data is loaded
  useEffect(() => {
    if (userRouteSettings) {
      updateRouteSettings({
        hasTrailer: userRouteSettings.trailerType === "TRAILER_53",
        routingMode: userRouteSettings.routingType.toLowerCase() as "practical" | "shortest",
        distanceUnit: userRouteSettings.distanceUnit.toLowerCase() as "miles" | "km"
      })
    }
  }, [userRouteSettings, updateRouteSettings])

  // Handle settings change
  const handleSettingsChange = async (newSettings: Partial<typeof routeSettings>) => {
    // Update local store immediately
    updateRouteSettings(newSettings)

    if (!currentUser?.id) return

    const apiData = cleanObject({
      userId: currentUser.id,
      trailerType: (newSettings.hasTrailer ?? routeSettings.hasTrailer) ? "TRAILER_53" : "",
      routingType: ((newSettings.routingMode ?? routeSettings.routingMode) === "practical"
        ? "PRACTICAL"
        : "SHORTEST") as "PRACTICAL" | "SHORTEST",
      distanceUnit: ((newSettings.distanceUnit ?? routeSettings.distanceUnit) === "miles" ? "MILES" : "KM") as
        | "MILES"
        | "KM"
    }) as ICreateUserRouteSettingRequest

    try {
      if (isEditing && userRouteSettings) {
        // Update existing settings
        await updateMutation.mutateAsync({
          id: userRouteSettings.id,
          data: apiData as IUpdateUserRouteSettingRequest
        })
      } else if (is404Error || !userRouteSettings) {
        // Create new settings
        await createMutation.mutateAsync(apiData)
      }
    } catch (error) {
      console.error("Failed to save route settings:", error)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <SettingsIcon className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <h4 className="leading-none font-medium">Route Settings</h4>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="trailer"
                checked={routeSettings.hasTrailer}
                onCheckedChange={(checked) => handleSettingsChange({ hasTrailer: checked as boolean })}
              />
              <Label htmlFor="trailer">53' Trailer</Label>
            </div>
          </div>
          <div>
            <h4 className="leading-none font-medium">Routing</h4>
            <RadioGroup
              value={routeSettings.routingMode}
              onValueChange={(value) => handleSettingsChange({ routingMode: value as "practical" | "shortest" })}
              className="pt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="practical" id="practical" />
                <Label htmlFor="practical">Practical</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="shortest" id="shortest" />
                <Label htmlFor="shortest">Shortest</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <h4 className="leading-none font-medium">Distance in</h4>
            <RadioGroup
              value={routeSettings.distanceUnit}
              onValueChange={(value) => handleSettingsChange({ distanceUnit: value as "miles" | "km" })}
              className="pt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="miles" id="miles" />
                <Label htmlFor="miles">Miles</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="km" id="km" />
                <Label htmlFor="km">Km</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
