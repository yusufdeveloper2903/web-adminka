import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TruckFormFieldsProps {
  form: any // TanStack form instance
}

const TruckFormFields = ({ form }: TruckFormFieldsProps) => {
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
      {/* VIN Number */}
      <div className="space-y-2">
        <Label htmlFor="vinNumber">VIN Number</Label>
        <form.Field
          name="vinNumber"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter VIN Number"
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

      {/* Unit Number */}
      <div className="space-y-2">
        <Label htmlFor="unitNumber">Unit Number</Label>
        <form.Field
          name="unitNumber"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter Unit Number"
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

      {/* Samsara VIN */}
      <div className="space-y-2">
        <Label htmlFor="samsaraVin">Samsara VIN</Label>
        <form.Field
          name="samsaraVin"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter Samsara VIN"
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

      {/* Home Location */}
      <div className="space-y-2">
        <Label htmlFor="homeLocation">Home Location</Label>
        <form.Field
          name="homeLocation"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter Home Location"
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

      {/* License Plate */}
      <div className="space-y-2">
        <Label htmlFor="licencePlate">License Plate</Label>
        <form.Field
          name="licencePlate"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter License Plate"
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
    </div>
  )
}

export default TruckFormFields
