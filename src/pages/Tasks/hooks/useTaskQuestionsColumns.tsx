import type { ColumnDef } from "@tanstack/react-table"
import type { ITaskQuestion } from "@/types/tasks"
import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import CreateTaskQuestionForm from "../components/CreateTaskQuestionForm"

const useTaskQuestionsColumns = (): ColumnDef<ITaskQuestion>[] => {
  const { setConfig } = useDrawerStore()

  return [
    { accessorKey: "No", header: "№", meta: { className: "min-w-[60px] w-[4%]" }, cell: ({ row }) => <span>{row.index + 1}</span>, enableSorting: false },
    { accessorKey: "id", header: "ID", meta: { className: "min-w-[80px] w-[5%]" },enableSorting: false },
    { accessorKey: "answer", header: "Answer", meta: { className: "min-w-[200px] w-[45%]" },enableSorting: false },
    { accessorKey: "point", header: "Point", meta: { className: "min-w-[120px] w-[10%]" },enableSorting: false },
    { accessorKey: "dop_point", header: "Dop point", meta: { className: "min-w-[120px] w-[10%]" },enableSorting: false },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { className: "min-w-[120px] w-[10%]" },
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() =>
            setConfig({
              title: `Edit Question #${(row.original as any)?.index ?? row.index + 1}`,
              content: (
                <CreateTaskQuestionForm
                  defaultTaskId={(row.original as any)?.task || undefined}
                  initialQuestion={{
                    answer: (row.original as any)?.answer ?? "",
                    index: (row.original as any)?.index ?? row.index,
                    point: (row.original as any)?.point ?? null,
                    dop_point: (row.original as any)?.dop_point ?? null,
                    type: (row.original as any)?.type ?? "CHOICE",
                    // agar backenddan kelsa qo'llanadi; bo'lmasa form 4 ta bo'sh option beradi
                    option: (row.original as any)?.option
                  }}
                />
              ),
              width: "sm:max-w-3xl"
            })
          }
        >
          Edit
        </Button>
      )
    }
  ]
}

export default useTaskQuestionsColumns


