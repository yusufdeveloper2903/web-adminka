import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit } from "lucide-react"
import { useDrawerStore } from "@/store"
import TruckEditForm from "@/pages/Trips/components/TruckEditForm"

export type Trucks = {
  id: string
  unit: string
  driver: string
  company: string
  dispatcher: string
  license_plate: string
  samsara_vin: string
  gle_vin: string
  home_location: string
  current_location: string
  updated: string
}

const useTrucksColumns = (): ColumnDef<Trucks>[] => {
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
      accessorKey: "unit",
      header: "Unit",
      meta: {
        className: "min-w-[100px] w-[8%]"
      }
    },
    {
      accessorKey: "driver",
      header: "Driver",
      meta: {
        className: "min-w-[180px] w-[15%]"
      }
    },
    {
      accessorKey: "company",
      header: "Company",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },
    {
      accessorKey: "dispatcher",
      header: "Dispatcher",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },
    {
      accessorKey: "license_plate",
      header: "License Plate",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },
    {
      accessorKey: "samsara_vin",
      header: "Samsara VIN",
      meta: {
        className: "min-w-[180px] w-[15%]"
      }
    },
    {
      accessorKey: "gle_vin",
      header: "GLE VIN",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },
    {
      accessorKey: "home_location",
      header: "Home Location",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
    },
    {
      accessorKey: "current_location",
      header: "Current Location",
      meta: {
        className: "min-w-[180px] w-[15%]"
      }
    },
    {
      accessorKey: "updated",
      header: "Updated",
      meta: {
        className: "min-w-[120px] w-[10%]"
      }
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
