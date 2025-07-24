import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Map } from "lucide-react"

export type Trip = {
  id: number
  unitNumber: string
  driverName: string
  company: string
  loadNumber: string
  dispatcher: string
  miles: number
  totalEmpty: number
  pu: number
  trl: number
  totalMiles: number
  pickupLocation: string
  deliveryLocation: string
  updated: string
  status: "COMPLETED" | "IN_TRANSIT" | "PENDING"
  // Route data for map visualization
  gleLocation?: { polyline: string | string[] }
  samsaraLocation?: { polyline: string | string[] }
  tripStops?: Array<{
    id: number
    address: string
    latitude: number
    longitude: number
    stopType: string
    loadStatus: string
  }>
}

interface UseTripsColumnsProps {
  onRouteClick: (trip: Trip) => void
  onEditClick: (trip: Trip) => void
}

const useTripsColumns = ({ onRouteClick, onEditClick }: UseTripsColumnsProps): ColumnDef<Trip>[] => {
  return [
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
      accessorKey: "company",
      header: "Company",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },

    // Load Number column
    {
      accessorKey: "loadNumber",
      header: "Load Number",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },

    // Dispatcher column
    {
      accessorKey: "dispatcher",
      header: "Dispatcher",
      meta: {
        className: "min-w-[120px] w-[10%]"
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
        className: "min-w-[150px] w-[12%]"
      },
      cell: ({ row }) => (
        <span className="truncate" title={row.original.pickupLocation}>
          {row.original.pickupLocation}
        </span>
      )
    },

    // Delivery Location column
    {
      accessorKey: "deliveryLocation",
      header: "Delivery Location",
      meta: {
        className: "min-w-[150px] w-[12%]"
      },
      cell: ({ row }) => (
        <span className="truncate" title={row.original.deliveryLocation}>
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
      cell: ({ row }) => {
        const date = new Date(row.original.updated)
        return (
          <span className="text-muted-foreground text-sm">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )
      }
    },

    // Status column
    {
      accessorKey: "status",
      header: "Status",
      meta: {
        className: "min-w-[100px] w-[8%]"
      },
      cell: ({ row }) => {
        const variant: "secondary" | "outline" | "default" =
          row.original.status === "COMPLETED"
            ? "secondary"
            : row.original.status === "IN_TRANSIT"
              ? "outline"
              : "default"
        return (
          <Badge variant={variant} className="capitalize">
            {row.original.status.replace("_", " ").toLowerCase()}
          </Badge>
        )
      }
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
            <Button variant="ghost" size="icon" onClick={() => onRouteClick(trip)} title="View Route">
              <Map className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEditClick(trip)} title="Edit Trip">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useTripsColumns
