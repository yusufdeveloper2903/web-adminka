import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TasksFormFieldsProps {
  form: any
}

const TasksFormFields = ({ form }: TasksFormFieldsProps) => {
  const getErrorMessage = (field: any): string => {
    if (field.state.meta.errors.length === 0) return ""
    const error = field.state.meta.errors[0]
    if (typeof error === "object" && error.message) return error.message
    if (typeof error === "string") return error
    return "Invalid value"
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <form.Field
          name="title"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter title"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Number</Label>
        <form.Field
          name="number"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default TasksFormFields


