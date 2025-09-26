import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, EyeIcon } from "lucide-react"
import { useDrawerStore } from "@/store"
import { NewTruckForm } from "../components"
import { StatusBadge } from "@/components/shared"
import type { ITruckResponse } from "@/types"
import { TABLE_UI_FORMAT } from "@/constants"
import { formatUTCToCentral } from "@/lib"

const useTrucksColumns = (): ColumnDef<ITruckResponse>[] => {
  const { setConfig: setDrawerConfig } = useDrawerStore()

  return [
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
      accessorKey: "unitNumber",
      header: "Unit",
      meta: {
        className: "min-w-[100px] w-[8%]"
      }
    },
    {
      accessorKey: "driverNames",
      header: "Driver",
      meta: {
        className: "min-w-[180px] w-[15%]"
      },
      enableSorting: false
    },
    {
      accessorKey: "assignUserName",
      header: "Assigned User",
      meta: {
        className: "min-w-[100px] w-[10%]"
      },
      enableSorting: false
    },
    
    {
      accessorKey: "companyName",
      header: "Company",
      meta: {
        className: "min-w-[200px]"
      },
      enableSorting: false
    },
    {
      accessorKey: "licencePlate",
      header: "License Plate",
      meta: {
        className: "min-w-[120px] w-[10%]"
      },
      enableSorting: false
    },
    {
      accessorKey: "samsaraVin",
      header: "Samsara VIN",
      meta: {
        className: "min-w-[180px] w-[15%]"
      },
      enableSorting: false
    },
    {
      accessorKey: "vinNumber",
      header: "GLE VIN",
      meta: {
        className: "min-w-[180px] w-[15%]"
      },
      enableSorting: false
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[100px] w-[8%]"
      },
      cell: ({ row }) => <StatusBadge isActive={row.original.active} />
    },
    {
      accessorKey: "homeLocation",
      header: "Home Location",
      meta: {
        className: "min-w-[120px] w-[10%]"
      },
      enableSorting: false
    },
    {
      accessorKey: "updated",
      header: "Updated",
      meta: {
        className: "min-w-[160px] w-[12%]"
      },
      cell: ({ getValue }) => formatUTCToCentral(getValue() as string, TABLE_UI_FORMAT)
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[120px] w-[10%] text-center"
      },
      cell: ({ row }) => {
        const truck = row.original

        return (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Truck: ${truck.unitNumber}`,
                  content: <NewTruckForm truck={truck} />
                })
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `View Truck: ${truck.id}`,
                  content: <NewTruckForm truck={truck} isViewMode />
                })
              }}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useTrucksColumns
