import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, Truck } from "lucide-react"
import { InputMask } from "@/components/shared"

interface CompanyFormFieldsProps {
  form: any // TanStack form instance
}

const CompanyFormFields = ({ form }: CompanyFormFieldsProps) => {
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
      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <form.Field
          name="name"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter company name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
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

      {/* US DOT */}
      <div className="space-y-2">
        <Label htmlFor="usDot">US DOT Number</Label>
        <form.Field
          name="usDot"
          children={(field: any) => (
            <div>
              <div className="relative">
                <Truck className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Enter US DOT number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full pl-10 font-mono ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
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

export default CompanyFormFields
