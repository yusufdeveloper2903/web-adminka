import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit } from "lucide-react"
import { useDrawerStore } from "@/store"
import { NewDispatcherForm } from "../components"
import type { IDispatcherResponse } from "@/types"
import dayjs from "dayjs"
import { UI_DATE_FORMAT } from "@/constants"

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
      id: "fullName",
      header: "Full Name",
      meta: {
        className: "min-w-[180px] w-[25%]"
      },
      cell: ({ row }) => {
        const firstName = row.getValue("firstName") as string
        const lastName = row.getValue("lastName") as string
        return `${firstName} ${lastName}`
      }
    },
    {
      accessorKey: "team",
      header: "Team",
      meta: {
        className: "min-w-[80px] w-[8%]"
      }
    },
    {
      accessorKey: "teamId",
      header: "Team ID",
      meta: {
        className: "min-w-[80px] w-[8%]"
      }
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[80px] w-[8%]"
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
        className: "min-w-[120px] w-[12%]"
      },
      cell: ({ getValue }) => dayjs(getValue() as string).format(UI_DATE_FORMAT)
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[80px] w-[8%] text-center"
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
