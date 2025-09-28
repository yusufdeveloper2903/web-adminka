import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useTaskByIdQuery } from "../hooks/useTaskByIdQuery"
import useTasksForm from "../hooks/useTasksForm"
import TasksFormFields from "./TasksFormFields"

interface EditTaskFormProps {
  id: number
}

const EditTaskForm = ({ id }: EditTaskFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { data, isLoading } = useTaskByIdQuery(id, !!id)

  const { form, isSubmitting } = useTasksForm({ task: data as any })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <TasksFormFields form={form} />

        {form.state.errors && form.state.errors.length > 0 && (
          <div className="text-sm text-red-500">
            {form.state.errors.map((error: any, index: number) => (
              <div key={index}>{typeof error === "string" ? error : "Validation error"}</div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={closeDrawer}>
            Close
          </Button>
          <Button type="submit" className="ml-2" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditTaskForm


