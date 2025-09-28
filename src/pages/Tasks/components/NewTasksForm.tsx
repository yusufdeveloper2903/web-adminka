import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import useTasksForm from "../hooks/useTasksForm"
import TasksFormFields from "./TasksFormFields"

const NewTasksForm = () => {
  const { closeDrawer } = useDrawerStore()
  const { form, resetForm, isSubmitting } = useTasksForm()

  const handleClearForm = () => {
    resetForm()
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

        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleClearForm}>
            Clear Form
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Task"}</Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewTasksForm


