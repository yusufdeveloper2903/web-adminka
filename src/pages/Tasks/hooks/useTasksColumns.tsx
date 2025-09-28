import { Button } from "@/components/ui/button"
import type { ITaskResponse } from "@/types/tasks"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, ArrowRight } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useDrawerStore } from "@/store"
import { useDeleteTaskMutation } from "@/hooks"
import { EditTaskForm } from "../components"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"

const useTasksColumns = (): ColumnDef<ITaskResponse>[] => {
  const { setConfig: setDrawerConfig } = useDrawerStore()
  const deleteMutation = useDeleteTaskMutation()
  const [confirmTaskId, setConfirmTaskId] = useState<number | null>(null)
  const navigate = useNavigate()

  return [
    {
      accessorKey: "No",
      header: "№",
      meta: { className: "min-w-[60px] w-[4%]" },
      cell: ({ row }) => <span>{row.index + 1}</span>,
      enableSorting: false
    },
    { accessorKey: "id", header: "ID", meta: { className: "min-w-[80px] w-[5%]" }, enableSorting: false },
    { accessorKey: "title", header: "Title", meta: { className: "min-w-[200px] w-[40%]" }, enableSorting: false },
    { accessorKey: "number", header: "Number", meta: { className: "min-w-[140px] w-[35%]" }, enableSorting: false },
    {
      id: "actions",
      header: "Actions",
      meta: { className: "min-w-[80px] w-[15%]  text-center" },
      enableSorting: false,
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="flex w-full items-center justify-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setDrawerConfig({ title: `Edit Task #${task.id}`, content: <EditTaskForm id={task.id} /> })
              }
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setConfirmTaskId(task.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/tasks/$id", params: { id: String(task.id) } })}
              title="Go to test"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            {confirmTaskId === task.id && (
              <Dialog open onOpenChange={(open) => !open && setConfirmTaskId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete task #{task.id}?</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmTaskId(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteMutation.mutate(task.id)
                        setConfirmTaskId(null)
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
      }
    }
  ]
}

export default useTasksColumns
