import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Key, Shield } from "lucide-react"
import { useCompanyByIdQuery } from "@/hooks/companies"

interface TokenFormFieldsProps {
  form: any
  companyId: number
}

const TokenFormFields = ({ form, companyId }: TokenFormFieldsProps) => {
  const { data: company } = useCompanyByIdQuery(companyId)

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
      {/* Samsara Token */}
      <div className="space-y-2">
        <Label htmlFor="samsaraToken">Samsara Token</Label>
        <form.Field
          name="samsaraToken"
          children={(field: any) => (
            <div>
              <div className="relative">
                <Key className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder={company?.samsaraToken || "Enter Samsara token"}
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

      {/* GLE Token */}
      <div className="space-y-2">
        <Label htmlFor="gleToken">GLE Token</Label>
        <form.Field
          name="gleToken"
          children={(field: any) => (
            <div>
              <div className="relative">
                <Shield className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder={company?.gleToken || "Enter GLE token"}
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

export default TokenFormFields
