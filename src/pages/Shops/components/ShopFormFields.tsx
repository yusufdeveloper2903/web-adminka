import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AutosuggestInput } from "@/components/shared/AutosuggestInput"
import type { HereAutosuggestResult } from "@/types"

interface ShopFormFieldsProps {
  form: any // TanStack form instance
}

const ShopFormFields = ({ form }: ShopFormFieldsProps) => {
  const handleLocationSelect = (location: HereAutosuggestResult) => {
    form.setFieldValue("location", location.address.label)
    form.setFieldValue("latitude", location.position.lat)
    form.setFieldValue("longitude", location.position.lng)
  }

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
      {/* Shop Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Shop Name</Label>
        <form.Field
          name="name"
          children={(field: any) => (
            <div>
              <Input
                placeholder="Enter shop name"
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

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <form.Field
          name="location"
          children={(field: any) => (
            <div>
              <AutosuggestInput
                value={field.state.value}
                onChange={field.handleChange}
                onLocationSelect={handleLocationSelect}
                placeholder="Enter location address"
                className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
      </div>

      {/* Coordinates Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Latitude */}
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <form.Field
            name="latitude"
            children={(field: any) => (
              <div>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.000000"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.handleBlur}
                  className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                  disabled
                />
                {field.state.meta.errors.length > 0 && (
                  <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                )}
              </div>
            )}
          />
        </div>

        {/* Longitude */}
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <form.Field
            name="longitude"
            children={(field: any) => (
              <div>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.000000"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.handleBlur}
                  className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
                  disabled
                />
                {field.state.meta.errors.length > 0 && (
                  <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default ShopFormFields
