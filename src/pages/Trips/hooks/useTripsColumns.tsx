import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Map, RouteIcon } from "lucide-react"
import { useCallback, useMemo } from "react"
import type { ITripListResponse } from "@/types"
import { useDrawerStore, useRouteStore, useTripsStore } from "@/store"
import { NewRouteForm, RouteSettingsPopover } from "../components"
import dayjs from "dayjs"
import { TABLE_UI_FORMAT } from "@/constants"

const useTripsColumns = () => {
  const { setView, setSelectedTripId } = useTripsStore()
  const { setTripData } = useRouteStore()
  const { setConfig: setDrawerConfig } = useDrawerStore()

  // Fetch selected trip data for edit mode

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
    [setSelectedTripId, setDrawerConfig, setView]
  )

  const columns: ColumnDef<ITripListResponse>[] = useMemo(
    () => [
      {
        accessorKey: "No",
        header: "№",
        meta: {
          className: "min-w-[60px] w-[4%]"
        },
        cell: ({ row }) => <span>{row.index + 1}</span>,
        enableSorting: false
      },
      {
        accessorKey: "id",
        header: "ID",
        meta: {
          className: "min-w-[80px] w-[5%]"
        },
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>
      },
      {
        accessorKey: "unitNumber",
        header: "Unit",
        meta: {
          className: "min-w-[80px] w-[6%]"
        },
        cell: ({ row }) => <span className="font-bold">{row.original.unitNumber}</span>
      },

      {
        accessorKey: "driverName",
        header: "Driver",
        meta: {
          className: "min-w-[150px] w-[11%]"
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
          className: "min-w-[120px] w-[8%] text-left"
        }
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
        accessorKey: "tripStatus",
        header: "Status",
        meta: {
          className: "min-w-[100px] w-[7%] text-left"
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
        accessorKey: "miles",
        header: "Miles",
        meta: {
          className: "min-w-[85px] w-[6%] bg-gray-50 dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.miles || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "totalEmpty",
        header: "Total Empty",
        meta: {
          className: "min-w-[110px] w-[7%] bg-gray-50 dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.totalEmpty || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "pu",
        header: "PU",
        meta: {
          className: "min-w-[75px] w-[5%] bg-gray-50 dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.pu || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "trl",
        header: "TRL",
        meta: {
          className: "min-w-[75px] w-[5%] bg-gray-50 dark:bg-gray-800 text-left"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.trl || 0).toLocaleString()}</span>
      },

      {
        accessorKey: "totalMiles",
        header: "Total Miles",
        meta: {
          className: "min-w-[115px] w-[7%] bg-gray-50 dark:bg-gray-800 text-left"
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
        accessorKey: "created",
        header: "Created",
        meta: {
          className: "min-w-[140px] w-[9%] text-left"
        },
        cell: ({ getValue }) => dayjs(getValue() as string).format(TABLE_UI_FORMAT)
      },

      {
        id: "actions",
        header: "Actions",
        meta: {
          className: "min-w-[100px] w-[6%] text-center"
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
            </div>
          )
        }
      }
    ],
    [handleEditClick, handleRouteClick]
  )

  return columns
}

export default useTripsColumns
