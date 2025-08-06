import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AutosuggestInput } from "@/components/shared/AutosuggestInput"
import type { HereAutosuggestResult, ITruckResponse } from "@/types"

interface TruckFormFieldsProps {
  truck?: ITruckResponse
  form: any
  isViewMode?: boolean
}

const TruckFormFields = ({ truck, form, isViewMode = false }: TruckFormFieldsProps) => {
  const handleLocationSelect = (location: HereAutosuggestResult) => {
    form.setFieldValue("homeLocation", location.address.label)
    form.setFieldValue("homeLatitude", location.position.lat)
    form.setFieldValue("homeLongitude", location.position.lng)
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
                disabled={isViewMode}
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
                disabled={isViewMode}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{getErrorMessage(field)}</div>
              )}
            </div>
          )}
        />
      </div>

      {isViewMode && (
        <section className="flex gap-4">
          <div className="w-full">
            <Label htmlFor="vehicleId">Vehicle ID</Label>
            <Input disabled={isViewMode} value={truck?.vehicleId || "N/A"} />
          </div>
        </section>
      )}

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
                disabled={isViewMode}
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
              <AutosuggestInput
                value={field.state.value}
                onChange={field.handleChange}
                onLocationSelect={handleLocationSelect}
                placeholder="Enter home location"
                className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                disabled={isViewMode}
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
        {/* Home Latitude */}
        <div className="space-y-2">
          <Label htmlFor="homeLatitude">Home Latitude</Label>
          <form.Field
            name="homeLatitude"
            children={(field: any) => (
              <div>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.000000"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || null)}
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

        {/* Home Longitude */}
        <div className="space-y-2">
          <Label htmlFor="homeLongitude">Home Longitude</Label>
          <form.Field
            name="homeLongitude"
            children={(field: any) => (
              <div>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.000000"
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(parseFloat(e.target.value) || null)}
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
                disabled={isViewMode}
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
