import { Button } from "@/components/ui"
import { useDrawerStore, useHeaderStore, useTripsStore } from "@/store"
import { Loader2, Plus, RefreshCw, RouteIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { NewRouteForm, RouteSettingsPopover } from "../components"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UseTripsHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTripsHeader = ({ isLoading, totalDBRowCount, refetch }: UseTripsHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { view, setView } = useTripsStore()

  // State for each filter
  const [unitFilter, setUnitFilter] = useState<string | undefined>()
  const [driverFilter, setDriverFilter] = useState<string | undefined>()
  const [loadFilter, setLoadFilter] = useState<string | undefined>()

  useEffect(() => {
    const addTripIcon = <Plus className="mr-2 h-4 w-4" />
    const refreshIcon = !isLoading ? <RefreshCw className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />

    setHeaderConfig({
      title: "Trips",
      metadata: `Total: ${totalDBRowCount} trips`,
      actions: [
        {
          id: "add_trip",
          label: "Add Trip",
          icon: addTripIcon,
          onClick: () =>
            setDrawerConfig({
              title: "New route: Practical, 53' Trailer, Miles",
              content: <NewRouteForm />,
              headerActions: [
                {
                  id: "route-icon",
                  node: (
                    <Button variant="ghost" onClick={() => setView("map")}>
                      <RouteIcon className="size-6" />
                    </Button>
                  )
                },
                {
                  id: "route-settings",
                  node: <RouteSettingsPopover />
                }
              ]
            })
        },
        {
          id: "refresh_trips",
          icon: refreshIcon,
          onClick: () => refetch(),
          variant: "outline",
          disabled: isLoading
        }
      ],
      filters: [
        {
          id: "unit",
          placeholder: "Unit",
          value: unitFilter,
          options: [
            { value: "unit-1", label: "Unit 1" },
            { value: "unit-2", label: "Unit 2" }
          ],
          onValueChange: setUnitFilter
        },
        {
          id: "driver",
          placeholder: "Driver",
          value: driverFilter,
          options: [
            { value: "driver-1", label: "Driver 1" },
            { value: "driver-2", label: "Driver 2" }
          ],
          onValueChange: setDriverFilter
        },
        {
          id: "load",
          placeholder: "Load",
          value: loadFilter,
          options: [
            { value: "load-1", label: "Load 1" },
            { value: "load-2", label: "Load 2" }
          ],
          onValueChange: setLoadFilter
        }
      ],
      viewSwitcher: (
        <Tabs value={view} onValueChange={(value) => setView(value as "table" | "map")}>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
        </Tabs>
      )
    })

    return () => {
      resetHeaderConfig()
    }
  }, [
    setHeaderConfig,
    resetHeaderConfig,
    setDrawerConfig,
    isLoading,
    refetch,
    totalDBRowCount,
    unitFilter,
    driverFilter,
    loadFilter,
    view,
    setView
  ])

  return { unitFilter, driverFilter, loadFilter }
}

export default useTripsHeader
