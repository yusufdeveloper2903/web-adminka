import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import InputMask from "@/components/shared/InputMask"
import type { IUser } from "@/types"
import type { useProfileForm } from "../hooks"

// Taking the form type from the hook itself for strong typing

interface ProfileFormFieldsProps {
  form: ReturnType<typeof useProfileForm>["form"]
  user: IUser
}

// Error handling helper from the template
const getErrorMessage = (field: any): string => {
  if (field.state.meta.errors.length === 0) return ""
  const error = field.state.meta.errors[0]
  if (typeof error === "object" && error.message) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Invalid value"
}

export const ProfileFormFields = ({ form, user }: ProfileFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <form.Field
            name="firstName"
            children={(field: any) => (
              <div>
                <Input
                  placeholder="Enter First Name"
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

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <form.Field
            name="lastName"
            children={(field: any) => (
              <div>
                <Input
                  placeholder="Enter Last Name"
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

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <form.Field
          name="phone"
          children={(field: any) => (
            <div>
              <InputMask
                maskType="phone"
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                // No onBlur for the mask, assuming it's not needed as per common usage
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
      </div>

      {/* Read-only fields */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user.email} disabled />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Input value={user.role} disabled />
      </div>
    </div>
  )
}
