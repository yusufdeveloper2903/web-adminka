import { useHeaderStore, useTripsViewStore } from "@/store"
import { Loader2, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

interface UseTrucksHeaderParams {
  isLoading: boolean
  totalDBRowCount: number
  refetch: () => void
}

const useTrucksHeader = ({ isLoading, totalDBRowCount, refetch }: UseTrucksHeaderParams) => {
  const { setConfig: setHeaderConfig, resetConfig: resetHeaderConfig } = useHeaderStore()
  const { view, setView } = useTripsViewStore()

  // State for each filter
  const [unitFilter, setUnitFilter] = useState<string | undefined>()
  const [driverFilter, setDriverFilter] = useState<string | undefined>()
  const [loadFilter] = useState<string | undefined>()

  useEffect(() => {
    const refreshIcon = !isLoading ? <RefreshCw className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />

    setHeaderConfig({
      title: "Trucks",
      metadata: `Total: ${totalDBRowCount} trucks`,
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
      ],
      actions: [
        {
          id: "refresh_trips",
          icon: refreshIcon,
          onClick: () => refetch(),
          variant: "outline",
          disabled: isLoading
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
