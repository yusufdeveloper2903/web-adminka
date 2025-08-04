import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Home, Building2, MapPin, Truck, Package } from "lucide-react"

interface SystemFormFieldsProps {
  form: any // TanStack form instance
}

const SystemFormFields = ({ form }: SystemFormFieldsProps) => {
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
    <div className="space-y-6">
      {/* Radius Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Radius Settings</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Home Radius */}
          <div className="space-y-2">
            <Label htmlFor="homeRadius">Home Radius (miles)</Label>
            <form.Field
              name="homeRadius"
              children={(field: any) => (
                <div>
                  <div className="relative">
                    <Home className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      type="number"
                      placeholder="Enter home radius"
                      value={field.state.value === 0 ? "" : field.state.value}
                      onChange={(e) => {
                        const value = e.target.value
                        field.handleChange(value === "" ? 0 : Number(value))
                      }}
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

          {/* Shop Radius */}
          <div className="space-y-2">
            <Label htmlFor="shopRadius">Shop Radius (miles)</Label>
            <form.Field
              name="shopRadius"
              children={(field: any) => (
                <div>
                  <div className="relative">
                    <Building2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      type="number"
                      placeholder="Enter shop radius"
                      value={field.state.value === 0 ? "" : field.state.value}
                      onChange={(e) => {
                        const value = e.target.value
                        field.handleChange(value === "" ? 0 : Number(value))
                      }}
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

          {/* Pickup Radius */}
          <div className="space-y-2">
            <Label htmlFor="pickupRadius">Pickup Radius (miles)</Label>
            <form.Field
              name="pickupRadius"
              children={(field: any) => (
                <div>
                  <div className="relative">
                    <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      type="number"
                      placeholder="Enter pickup radius"
                      value={field.state.value === 0 ? "" : field.state.value}
                      onChange={(e) => {
                        const value = e.target.value
                        field.handleChange(value === "" ? 0 : Number(value))
                      }}
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

          {/* Trailer Radius */}
          <div className="space-y-2">
            <Label htmlFor="trailerRadius">Trailer Radius (miles)</Label>
            <form.Field
              name="trailerRadius"
              children={(field: any) => (
                <div>
                  <div className="relative">
                    <Truck className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      type="number"
                      placeholder="Enter trailer radius"
                      value={field.state.value === 0 ? "" : field.state.value}
                      onChange={(e) => {
                        const value = e.target.value
                        field.handleChange(value === "" ? 0 : Number(value))
                      }}
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

          {/* Delivery Radius */}
          <div className="space-y-2">
            <Label htmlFor="deliveryRadius">Delivery Radius (miles)</Label>
            <form.Field
              name="deliveryRadius"
              children={(field: any) => (
                <div>
                  <div className="relative">
                    <Package className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      type="number"
                      placeholder="Enter delivery radius"
                      value={field.state.value === 0 ? "" : field.state.value}
                      onChange={(e) => {
                        const value = e.target.value
                        field.handleChange(value === "" ? 0 : Number(value))
                      }}
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
      </div>

      {/* Service Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Trip Services</h3>

        <div className="space-y-4">
          {/* Samsara Trips */}
          <div className="space-y-2">
            <form.Field
              name="samsaraEnabled"
              children={(field: any) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="samsaraEnabled"
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="samsaraEnabled" className="text-sm font-medium">
                    Samsara Trips
                  </Label>
                </div>
              )}
            />
          </div>

          {/* GLE Trips */}
          <div className="space-y-2">
            <form.Field
              name="gleEnabled"
              children={(field: any) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gleEnabled"
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="gleEnabled" className="text-sm font-medium">
                    GLE Trips
                  </Label>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemFormFields
