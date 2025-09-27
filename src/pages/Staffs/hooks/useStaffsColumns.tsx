import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import type { IStaffResponse } from "@/types/staffs"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { EditStaffForm } from "../components"
import { useDeleteStaffMutation } from "@/hooks"

const useStaffsColumns = (): ColumnDef<IStaffResponse>[] => {
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const deleteMutation = useDeleteStaffMutation()

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
    { accessorKey: "id", header: "ID", meta: { className: "min-w-[80px] w-[5%]" } },
    { accessorKey: "username", header: "Username", meta: { className: "min-w-[160px] w-[20%]" } },
    { accessorKey: "first_name", header: "First name", meta: { className: "min-w-[160px] w-[20%]" } },
    { accessorKey: "sur_name", header: "Sur name", meta: { className: "min-w-[160px] w-[20%]" } },
    { accessorKey: "mid_name", header: "Mid name", meta: { className: "min-w-[160px] w-[20%]" } },
    {
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[80px] w-[15%]  text-center"
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex w-full items-center justify-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDrawerConfig({
                  title: `Edit Staff #${user.id}`,
                  content: <EditStaffForm id={user.id} />
                })
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm(`Delete staff #${user.id}?`)) {
                  deleteMutation.mutate(user.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useStaffsColumns
