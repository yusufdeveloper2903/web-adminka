import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Key } from "lucide-react"
import { useDrawerStore } from "@/store"
import { NewDispatcherForm, TokenForm } from "../components"
import { StatusBadge } from "@/components/shared"
import type { IDispatcherResponse } from "@/types"
import { TABLE_UI_FORMAT } from "@/constants"
import { formatUTCToCentral } from "@/lib"

const useDispatchersColumns = (): ColumnDef<IDispatcherResponse>[] => {
  const { setConfig: setDrawerConfig, closeDrawer } = useDrawerStore()

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
      accessorKey: "id",
      header: "ID",
      meta: {
        className: "min-w-[80px] w-[5%]"
      },
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>
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
      cell: ({ getValue }) => <StatusBadge isActive={getValue() as boolean} />
    },
    {
      accessorKey: "created",
      header: "Created",
      meta: {
        className: "min-w-[120px] w-[15%]"
      },
      cell: ({ getValue }) => formatUTCToCentral(getValue() as string, TABLE_UI_FORMAT)
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
          <div className="flex justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Dispatcher: ${dispatcher.firstName} ${dispatcher.lastName}`,
                  content: <NewDispatcherForm dispatcher={dispatcher} onClose={closeDrawer} />
                })
              }}
              title="Edit Dispatcher"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Update API Tokens`,
                  content: <TokenForm dispatcher={dispatcher} onClose={closeDrawer} />
                })
              }}
            >
              <Key className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useDispatchersColumns
