import { useEffect, useState } from "react"
import { useHeaderStore } from "@/store/header-store"
import { Plus, RefreshCw, Loader2, ArrowUpToLine } from "lucide-react"

interface UseTripsHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTripsHeader = ({ isLoading, totalDBRowCount, refetch }: UseTripsHeaderParams) => {
  const { setConfig, resetConfig } = useHeaderStore()

  // State for each filter
  const [unitFilter, setUnitFilter] = useState<string | undefined>()
  const [driverFilter, setDriverFilter] = useState<string | undefined>()
  const [loadFilter, setLoadFilter] = useState<string | undefined>()

  useEffect(() => {
    const addTripIcon = <Plus className="mr-2 h-4 w-4" />
    const refreshIcon = !isLoading ? <RefreshCw className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />

    setConfig({
      title: "Trips",
      metadata: `Total: ${totalDBRowCount} trips`,
      actions: [
        {
          id: "add_trip",
          label: "Add Trip",
          icon: addTripIcon,
          onClick: () => console.log("Add new trip")
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
      ]
    })

    return () => {
      resetConfig()
    }
  }, [setConfig, resetConfig, isLoading, refetch, totalDBRowCount, unitFilter, driverFilter, loadFilter])

  return { unitFilter, driverFilter, loadFilter }
}

export default useTripsHeader
