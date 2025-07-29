import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Mail, Phone, Shield } from "lucide-react"
import type { UserRoleType } from "@/types"
import { InputMask } from "@/components/shared"

interface UserFormFieldsProps {
  form: any // TanStack form instance
}

const UserFormFields = ({ form }: UserFormFieldsProps) => {
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

  const UserRoleOptions: { value: UserRoleType; label: string }[] = [
    { value: "OWNER", label: "Owner" },
    { value: "DISPATCHER", label: "Dispatcher" },
    { value: "DRIVER", label: "Driver" }
  ]

  return (
    <div className="space-y-4">
      {/* Name Fields Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <form.Field
            name="firstName"
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

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <form.Field
            name="lastName"
            children={(field: any) => (
              <div>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Enter last name"
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

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <form.Field
          name="email"
          children={(field: any) => (
            <div>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="email"
                  placeholder="Enter email address"
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

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <form.Field
          name="phone"
          children={(field: any) => (
            <div>
              <div className="relative">
                <InputMask maskType="phone" value={field.state.value} onChange={(value) => field.handleChange(value)} />
                {field.state.meta.errors.length > 0 && (
                  <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                )}
              </div>
            </div>
          )}
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <form.Field
          name="role"
          children={(field: any) => (
            <div>
              <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                <SelectTrigger className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}>
                  <div className="flex items-center">
                    <Shield className="text-muted-foreground mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {UserRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default UserFormFields
