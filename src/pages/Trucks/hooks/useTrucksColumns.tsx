import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit } from "lucide-react"
import { useDrawerStore } from "@/store"
import TruckEditForm from "@/pages/Trips/components/TruckEditForm"
import type { ITruckResponse } from "@/types"
import dayjs from "dayjs"
import { BACKEND_DATETIME_FORMAT } from "@/constants"

const useTrucksColumns = (): ColumnDef<ITruckResponse>[] => {
  const { setConfig: setDrawerConfig, closeDrawer } = useDrawerStore()

  return [
    {
      accessorKey: "id",
      header: "No",
      meta: {
        className: "min-w-[60px] w-[5%]"
      }
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
      }
    },
    {
      accessorKey: "companyName",
      header: "Company",
      meta: {
        className: "min-w-[200px]"
      }
    },
    {
      accessorKey: "licencePlate",
      header: "License Plate",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },
    {
      accessorKey: "samsaraVin",
      header: "Samsara VIN",
      meta: {
        className: "min-w-[180px] w-[15%]"
      }
    },
    {
      accessorKey: "vinNumber",
      header: "GLE VIN",
      meta: {
        className: "min-w-[180px] w-[15%]"
      }
    },
    {
      accessorKey: "homeLocation",
      header: "Home Location",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },
    {
      accessorKey: "updated",
      header: "Updated",
      meta: {
        className: "min-w-[160px] w-[12%]"
      },
      cell: ({ getValue }) => dayjs(getValue() as string).format(BACKEND_DATETIME_FORMAT)
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[120px] w-[10%] text-center"
      },
      cell: () => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: "Edit Truck",
                  width: "sm:max-w-md",
                  content: (
                    <TruckEditForm
                      onClose={closeDrawer}
                      onSubmit={(data) => {
                        console.log("Truck data:", data)
                        closeDrawer()
                      }}
                    />
                  )
                })
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useTrucksColumns
