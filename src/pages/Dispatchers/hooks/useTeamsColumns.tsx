import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit } from "lucide-react"
import { useDrawerStore } from "@/store"
import { NewTeamForm } from "../components"
import type { ITeamResponse } from "@/types"
import dayjs from "dayjs"
import { TABLE_UI_FORMAT } from "@/constants"

const useTeamsColumns = (): ColumnDef<ITeamResponse>[] => {
  const { setConfig: setDrawerConfig, closeDrawer } = useDrawerStore()

  return [
    {
      accessorKey: "id",
      header: "ID",
      meta: {
        className: "min-w-[60px] w-[8%]"
      }
    },
    {
      accessorKey: "name",
      header: "Team Name",
      meta: {
        className: "min-w-[200px] w-[40%]"
      }
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        className: "min-w-[80px] w-[12%]"
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
      accessorKey: "updatedAt",
      header: "Updated",
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
        const team = row.original

        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Team: ${team.name}`,
                  content: <NewTeamForm team={team} onClose={closeDrawer} />
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

export default useTeamsColumns
