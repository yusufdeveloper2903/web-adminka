import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import type { IStaffResponse } from "@/types/staffs"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { EditStaffForm } from "../components"
import { useDeleteStaffMutation } from "@/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"

const useStaffsColumns = (): ColumnDef<IStaffResponse>[] => {
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const deleteMutation = useDeleteStaffMutation()
  const [confirmStaffId, setConfirmStaffId] = useState<number | null>(null)

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
                setConfirmStaffId(user.id)
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>

            {confirmStaffId === user.id && (
              <Dialog open onOpenChange={(open) => !open && setConfirmStaffId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete staff #{user.id}?</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmStaffId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteMutation.mutate(user.id)
                        setConfirmStaffId(null)
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )
      },
      enableSorting: false
    }
  ]
}

export default useStaffsColumns
