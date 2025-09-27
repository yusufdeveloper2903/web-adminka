import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { User } from "lucide-react"

interface StaffsFormFieldsProps {
  form: any // TanStack form instance
}

const StaffsFormFields = ({ form }: StaffsFormFieldsProps) => {
  // Helper function to get error message from field
  const getErrorMessage = (field: any): string => {
    if (field.state.meta.errors.length === 0) return ""

    const error = field.state.meta.errors[0]
    // Handle Zod validation error objects
    if (typeof error === "object" && error.message) {
      return error.message
    }
    // Handle string errors
    if (typeof error === "string") {
      return error
    }
    return "Invalid value"
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <form.Field
          name="username"
          children={(field: any) => (
            <div>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Enter username"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full pl-10 ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <form.Field
            name="first_name"
            children={(field: any) => (
              <div>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Enter first name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`w-full pl-10 ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                )}
              </div>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sur_name">Surname</Label>
          <form.Field
            name="sur_name"
            children={(field: any) => (
              <div>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Enter surname"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={`w-full pl-10 ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mid_name">Mid name</Label>
        <form.Field
          name="mid_name"
          children={(field: any) => (
            <div>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Enter mid name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full pl-10 ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                />
              </div>
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

export default StaffsFormFields
