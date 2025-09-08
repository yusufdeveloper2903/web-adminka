import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit } from "lucide-react"
import { useDrawerStore } from "@/store"
import { NewTeamForm } from "../components"
import { StatusBadge } from "@/components/shared"
import type { ITeamResponse } from "@/types"
import { TABLE_UI_FORMAT } from "@/constants"
import { formatUTCToCentral } from "@/lib"

const useTeamsColumns = (): ColumnDef<ITeamResponse>[] => {
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
      accessorKey: "id",
      header: "ID",
      meta: {
        className: "min-w-[80px] w-[5%]"
      },
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>
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
      accessorKey: "updated",
      header: "Updated",
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
        const team = row.original

        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Team: ${team.name}`,
                  content: <NewTeamForm team={team} />
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
