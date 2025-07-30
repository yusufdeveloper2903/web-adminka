import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Map, RouteIcon } from "lucide-react"
import { useCallback, useMemo } from "react"
import type { ITripListResponse } from "@/types"
import { useDrawerStore, useRouteStore, useTripsStore } from "@/store"
import { NewRouteForm, RouteSettingsPopover } from "../components"
import dayjs from "dayjs"
import { TABLE_UI_FORMAT } from "@/constants"

export type Trip = ITripListResponse & {
  // Route data for map visualization (optional extensions)
  gleLocation?: { polyline: string | string[] }
  samsaraLocation?: { polyline: string | string[] }
}

const useTripsColumns = (): ColumnDef<Trip>[] => {
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

  return useMemo(
    () => [
      // No column
      {
        accessorKey: "id",
        header: "No",
        meta: {
          className: "min-w-[60px] w-[4%]"
        }
      },

      // Unit column (bold)
      {
        accessorKey: "unitNumber",
        header: "Unit",
        meta: {
          className: "min-w-[80px] w-[6%]"
        },
        cell: ({ row }) => <span className="font-bold">{row.original.unitNumber}</span>
      },

      // Driver column (bold)
      {
        accessorKey: "driverName",
        header: "Driver",
        meta: {
          className: "min-w-[150px] w-[12%]"
        },
        cell: ({ row }) => <span className="font-bold">{row.original.driverName}</span>
      },

      // Company column
      {
        accessorKey: "companyName",
        header: "Company",
        meta: {
          className: "min-w-[120px] w-[9%]"
        }
      },

      // Load Number column
      {
        accessorKey: "loadNumber",
        header: "Load Number",
        meta: {
          className: "min-w-[120px] w-[9%]"
        }
      },

      // Dispatcher column
      {
        accessorKey: "dispatcherName",
        header: "Dispatcher",
        meta: {
          className: "min-w-[120px] w-[9%]"
        }
      },

      // Trip Status column
      {
        accessorKey: "tripStatus",
        header: "Status",
        meta: {
          className: "min-w-[100px] w-[7%]"
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

      // Miles column (gray background, sortable)
      {
        accessorKey: "miles",
        header: "Miles",
        meta: {
          className: "min-w-[80px] w-[6%] bg-gray-50 dark:bg-gray-800"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.miles || 0).toLocaleString()}</span>
      },

      // Total Empty column (gray background, sortable)
      {
        accessorKey: "totalEmpty",
        header: "Total Empty",
        meta: {
          className: "min-w-[100px] w-[7%] bg-gray-50 dark:bg-gray-800"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.totalEmpty || 0).toLocaleString()}</span>
      },

      // PU column (gray background, sortable)
      {
        accessorKey: "pu",
        header: "PU",
        meta: {
          className: "min-w-[70px] w-[5%] bg-gray-50 dark:bg-gray-800"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.pu || 0).toLocaleString()}</span>
      },

      // TRL column (gray background, sortable)
      {
        accessorKey: "trl",
        header: "TRL",
        meta: {
          className: "min-w-[70px] w-[5%] bg-gray-50 dark:bg-gray-800"
        },
        cell: ({ row }) => <span className="font-medium">{(row.original.trl || 0).toLocaleString()}</span>
      },

      // Total Miles column (gray background, sortable)
      {
        accessorKey: "totalMiles",
        header: "Total Miles",
        meta: {
          className: "min-w-[100px] w-[7%] bg-gray-50 dark:bg-gray-800"
        },
        cell: ({ row }) => (
          <span className="font-medium text-blue-600">{(row.original.totalMiles || 0).toLocaleString()}</span>
        )
      },

      // Pickup Location column
      {
        accessorKey: "pickupLocation",
        header: "Pickup Location",
        meta: {
          className: "min-w-[140px] w-[11%]"
        },
        cell: ({ row }) => (
          <span className="truncate" title={row.original.pickupLocation!}>
            {row.original.pickupLocation}
          </span>
        )
      },

      // Delivery Location column
      {
        accessorKey: "deliveryLocation",
        header: "Delivery Location",
        meta: {
          className: "min-w-[140px] w-[11%]"
        },
        cell: ({ row }) => (
          <span className="truncate" title={row.original.deliveryLocation!}>
            {row.original.deliveryLocation}
          </span>
        )
      },

      // Updated column
      {
        accessorKey: "updated",
        header: "Updated",
        meta: {
          className: "min-w-[120px] w-[8%]"
        },
        cell: ({ getValue }) => dayjs(getValue() as string).format(TABLE_UI_FORMAT)
      },

      // Actions column
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
        },
        enableSorting: false
      }
    ],
    [handleEditClick, handleRouteClick]
  )
}

export default useTripsColumns
