import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Map, Printer } from "lucide-react"

export type Trip = {
  id: string
  truck: string
  trailer: string
  driver: string
  status: "Delivered" | "In Transit" | "Pending"
  origin: string
  destination: string
}

const useTripsColumns = (): ColumnDef<Trip>[] => {
  return [
    {
      accessorKey: "id",
      header: "ID",
      meta: {
        className: "min-w-[60px] w-[8%]"
      }
    },
    {
      accessorKey: "truck",
      header: "Truck",
      enableSorting: false,
      meta: {
        className: "min-w-[120px] w-[12%]"
      }
    },
    {
      accessorKey: "trailer",
      header: "Trailer",
      meta: {
        className: "min-w-[120px] w-[12%]"
      }
    },
    {
      accessorKey: "driver",
      header: "Driver",
      meta: {
        className: "min-w-[150px] w-[15%]"
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: {
        className: "min-w-[100px] w-[10%]"
      },
      cell: ({ row }) => {
        const variant: "secondary" | "outline" | "default" =
          row.original.status === "Delivered"
            ? "secondary"
            : row.original.status === "In Transit"
              ? "outline"
              : "default"
        return (
          <Badge variant={variant} className="capitalize">
            {row.original.status}
          </Badge>
        )
      }
    },
    {
      accessorKey: "origin",
      header: "Origin",
      meta: {
        className: "min-w-[180px] w-[18%]"
      }
    },
    {
      accessorKey: "destination",
      header: "Destination",
      meta: {
        className: "min-w-[180px] w-[18%]"
      }
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[100px] w-[10%] text-center"
      },
      cell: ({ row }) => {
        const trip = row.original
        return (
          <div className="flex justify-center ">
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Map className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useTripsColumns
