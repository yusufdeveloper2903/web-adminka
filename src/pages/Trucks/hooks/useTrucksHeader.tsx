import { useHeaderStore, useTripsViewStore, useDrawerStore } from "@/store"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { NewTruckForm } from "../components"

interface UseTrucksHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTrucksHeader = ({ isLoading, totalDBRowCount, refetch }: UseTrucksHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const { view, setView } = useTripsViewStore()

  // State for each filter
  const [unitFilter, setUnitFilter] = useState<string | undefined>()
  const [driverFilter, setDriverFilter] = useState<string | undefined>()
  const [loadFilter] = useState<string | undefined>()

  useEffect(() => {
    const addTruckIcon = <Plus className="mr-2 h-4 w-4" />
    const refreshIcon = !isLoading ? <RefreshCw className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />

    setHeaderConfig({
      title: "Trucks",
      metadata: `Total: ${totalDBRowCount} trucks`,
      actions: [
        {
          id: "add_truck",
          label: "Add Truck",
          icon: addTruckIcon,
          onClick: () =>
            setDrawerConfig({
              title: "Add New Truck",
              content: <NewTruckForm />
            })
        },
        {
          id: "refresh_trucks",
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
        }
      ]
    })

    return () => {
      resetHeaderConfig()
    }
  }, [
    setHeaderConfig,
    resetHeaderConfig,
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

export default useTrucksHeader
