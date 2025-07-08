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
      cell: (info) => info.getValue()
    },
    {
      accessorKey: "truck",
      header: "Truck",
      enableSorting: false
    },
    {
      accessorKey: "trailer",
      header: "Trailer"
    },
    {
      accessorKey: "driver",
      header: "Driver"
    },
    {
      accessorKey: "status",
      header: "Status",
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
      header: "Origin"
    },
    {
      accessorKey: "destination",
      header: "Destination"
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const trip = row.original
        return (
          <div className="flex justify-end gap-2">
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
