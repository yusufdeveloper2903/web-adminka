import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit } from "lucide-react"
import { useDrawerStore } from "@/store"
import { NewDispatcherForm } from "../components"
import type { IDispatcherResponse } from "@/types"
import dayjs from "dayjs"
import { TABLE_UI_FORMAT } from "@/constants"

const useDispatchersColumns = (): ColumnDef<IDispatcherResponse>[] => {
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
      accessorKey: "firstName",
      header: "First Name",
      meta: {
        className: "min-w-[120px] w-[20%]"
      }
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      meta: {
        className: "min-w-[120px] w-[20%]"
      }
    },
    {
      accessorKey: "team",
      header: "Team",
      meta: {
        className: "min-w-[120px] w-[15%]"
      }
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[100px] w-[15%]"
      },
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        )
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      meta: {
        className: "min-w-[120px] w-[15%]"
      },
      cell: ({ getValue }) => dayjs(getValue() as string).format(TABLE_UI_FORMAT)
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[80px] w-[10%] text-center"
      },
      cell: ({ row }) => {
        const dispatcher = row.original

        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Dispatcher: ${dispatcher.firstName} ${dispatcher.lastName}`,
                  content: <NewDispatcherForm dispatcher={dispatcher} onClose={closeDrawer} />
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

export default useDispatchersColumns
