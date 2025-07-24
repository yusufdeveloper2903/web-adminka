import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SettingsIcon } from "lucide-react"
import { useRouteStore } from "@/store"

export const RouteSettingsPopover = () => {
  const { routeSettings, updateRouteSettings } = useRouteStore()

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
                onCheckedChange={(checked) => updateRouteSettings({ hasTrailer: checked as boolean })}
              />
              <Label htmlFor="trailer">53' Trailer</Label>
            </div>
          </div>
          <div>
            <h4 className="leading-none font-medium">Routing</h4>
            <RadioGroup
              value={routeSettings.routingMode}
              onValueChange={(value) => updateRouteSettings({ routingMode: value as "practical" | "shortest" })}
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
              onValueChange={(value) => updateRouteSettings({ distanceUnit: value as "miles" | "km" })}
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
