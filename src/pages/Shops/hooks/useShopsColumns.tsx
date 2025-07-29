import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, MapPin } from "lucide-react"
import { useDrawerStore } from "@/store"
import { NewShopForm } from "../components"
import type { IShopResponse } from "@/types"
import dayjs from "dayjs"
import { TABLE_UI_FORMAT } from "@/constants"

const useShopsColumns = (): ColumnDef<IShopResponse>[] => {
  const { setConfig: setDrawerConfig, closeDrawer } = useDrawerStore()

  return [
    {
      accessorKey: "id",
      header: "ID",
      meta: {
        className: "min-w-[60px] w-[5%]"
      }
    },
    {
      accessorKey: "name",
      header: "Shop Name",
      meta: {
        className: "min-w-[150px] w-[25%]"
      },
      cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>
    },
    {
      accessorKey: "location",
      header: "Location",
      meta: {
        className: "min-w-[200px] w-[30%]"
      },
      cell: ({ getValue }) => (
        <div className="flex items-center space-x-2">
          <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="truncate">{getValue() as string}</span>
        </div>
      )
    },
    {
      id: "coordinates",
      header: "Coordinates",
      meta: {
        className: "min-w-[150px] w-[20%]"
      },
      cell: ({ row }) => (
        <div className="text-muted-foreground font-mono text-sm">
          {row.original.latitude.toFixed(6)}, {row.original.longitude.toFixed(6)}
        </div>
      )
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[80px] w-[8%]"
      },
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean
        return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      meta: {
        className: "min-w-[120px] w-[12%]"
      },
      cell: ({ getValue }) => dayjs(getValue() as string).format(TABLE_UI_FORMAT)
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[80px] w-[8%] text-center"
      },
      cell: ({ row }) => {
        const shop = row.original

        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Shop: ${shop.name}`,
                  content: <NewShopForm shop={shop} onClose={closeDrawer} />
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

export default useShopsColumns
