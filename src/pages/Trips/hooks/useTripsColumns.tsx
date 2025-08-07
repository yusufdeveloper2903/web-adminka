import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Map, FileText } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import type { ITripListResponse } from "@/types"
import { useDrawerStore, useRouteStore, useTripsStore } from "@/store"
import { NewRouteForm, RouteSettingsPopover } from "../components"
import TripMileageReportDialog from "../components/TripMileageReportDialog"
import { formatUTCToCDT } from "@/lib"
import { TABLE_UI_FORMAT } from "@/constants"

const useTripsColumns = () => {
  const { setView, setSelectedTripId } = useTripsStore()
  const { setTripData } = useRouteStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()

  // State for mileage report dialog
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  const handleRouteClick = useCallback(
    (trip: any) => {
      setSelectedTripId(trip.id)

      // Set trip data to route store for map visualization
      setTripData(trip)

      // Switch to map view
      setView("map")
    },
    [setSelectedTripId, setView, setTripData]
  )

  const handleEditClick = useCallback(
    (trip: ITripListResponse) => {
      // Set selected trip ID to fetch detailed data
      setSelectedTripId(trip.id)

      // Open drawer with edit form
      setDrawerConfig({
        title: `Edit Trip: ${trip.loadNumber}`,
        content: <NewRouteForm editMode={true} />,
        width: "sm:max-w-5xl",
        headerActions: [
          {
            id: "route-settings",
            node: <RouteSettingsPopover />
          }
        ]
      })
    },
    [setSelectedTripId, setDrawerConfig]
  )

  const handleReportClick = useCallback(
    (trip: ITripListResponse) => {
      setTripData(trip)
      setIsReportDialogOpen(true)
    },
    [setTripData]
  )

  const columns: ColumnDef<ITripListResponse>[] = useMemo(
    () => [
      {
        accessorKey: "No",
        header: "№",
        meta: {
          className: "min-w-[40px] w-[2%]"
        },
        cell: ({ row }) => <span>{row.index + 1}</span>,
        enableSorting: false
      },
      {
        accessorKey: "unitNumber",
        header: "Unit",
        meta: {
          className: "min-w-[50px] w-[5%]"
        },
        cell: ({ row }) => <span className="font-bold">{row.original.unitNumber}</span>,
        enableSorting: false
      },

      {
        accessorKey: "driverName",
        header: "Driver",
        meta: {
          className: "min-w-[140px] w-[10%]"
        },
        cell: ({ row }) => <span className="font-bold">{row.original.driverName}</span>,
        enableSorting: false
      },

      {
        accessorKey: "companyName",
        header: "Company",
        meta: {
          className: "min-w-[120px] w-[8%] text-left"
        },
        enableSorting: false
      },

      {
        accessorKey: "loadNumber",
        header: "Load Number",
        meta: {
          className: "min-w-[115px] w-[8%] text-left"
        },
        enableSorting: false
      },

      {
        accessorKey: "dispatcherName",
        header: "Dispatcher",
        meta: {
          className: "min-w-[120px] w-[8%] text-left"
        },
        enableSorting: false
      },
      {
        accessorKey: "miles",
        header: (<div className="!text-gray-900 dark:!text-gray-100">Miles</div>) as any,
        meta: {
          className: "min-w-[60px] w-[6%] bg-gray-table dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.miles || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "totalEmpty",
        header: (<div className="!text-gray-900 dark:!text-gray-100">Total Empty</div>) as any,
        meta: {
          className: "min-w-[105px] w-[8%] bg-gray-table dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.totalEmpty || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "pu",
        header: (<div className="!text-gray-900 dark:!text-gray-100">PU</div>) as any,
        meta: {
          className: "min-w-[55px] w-[5%] bg-gray-table dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.pu || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "trl",
        header: (<div className="!text-gray-900 dark:!text-gray-100">TRL</div>) as any,
        meta: {
          className: "min-w-[60px] w-[5%] bg-gray-table dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.trl || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "totalMiles",
        header: (<div className="!text-gray-900 dark:!text-gray-100">TOTAL MILES</div>) as any,
        meta: {
          className: "min-w-[115px] w-[7%] bg-gray-table dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => (
          <span className="font-medium text-blue-600">{(row.original.totalMiles || 0).toLocaleString()}</span>
        )
      },

      {
        accessorKey: "pickupLocation",
        header: "Pickup Location",
        meta: {
          className: "min-w-[140px] w-[11%] text-left"
        },
        cell: ({ row }) => (
          <span className="truncate" title={row.original.pickupLocation!}>
            {row.original.pickupLocation}
          </span>
        ),
        enableSorting: false
      },
      {
        accessorKey: "deliveryLocation",
        header: "Delivery Location",
        meta: {
          className: "min-w-[140px] w-[11%] text-left"
        },
        cell: ({ row }) => (
          <span className="truncate" title={row.original.deliveryLocation!}>
            {row.original.deliveryLocation}
          </span>
        ),
        enableSorting: false
      },

      {
        accessorKey: "updated",
        header: "Updated",
        meta: {
          className: "min-w-[120px] w-[11%] text-left"
        },
        cell: ({ getValue }) => formatUTCToCDT(getValue() as string, TABLE_UI_FORMAT)
      },
      {
        accessorKey: "tripStatus",
        header: "Status",
        meta: {
          className: "min-w-[100px] w-[9%] text-left"
        },
        cell: ({ row }) => {
          const status = row.original.tripStatus
          let statusClass = ""
          let statusText = status

          switch (status) {
            case "UPCOMING":
              statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              statusText = "Upcoming"
              break
            case "IN_TRANSIT":
            case "IN TRANSIT":
              statusClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
              statusText = "In Transit"
              break
            case "COMPLETED":
              statusClass = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              statusText = "Completed"
              break
            default:
              statusClass = "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
          }

          return (
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}>
              {statusText}
            </span>
          )
        }
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          className: "min-w-[100px] w-[11%] text-center"
        },
        cell: ({ row }) => {
          const trip = row.original
          return (
            <div className="flex justify-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleRouteClick(trip)} title="View Route">
                <Map className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEditClick(trip)} title="Edit Trip">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleReportClick(trip)} title="Mileage Report">
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          )
        }
      }
    ],
    [handleEditClick, handleReportClick, handleRouteClick]
  )

  return {
    columns,
    reportDialog: (
      <TripMileageReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => {
          setIsReportDialogOpen(false)
          setTripData(null)
        }}
      />
    )
  }
}

export default useTripsColumns
