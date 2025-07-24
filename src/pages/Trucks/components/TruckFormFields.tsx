import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - keyinchalik backend dan keladi
const dispatcherOptions = [
  { value: "1", label: "John Doe" },
  { value: "2", label: "Jane Smith" },
  { value: "3", label: "Mike Johnson" }
]

interface TruckFormFieldsProps {
  form: any // TanStack form instance
}

const TruckFormFields = ({ form }: TruckFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* VIN Number */}
      <div className="space-y-2">
        <Label htmlFor="vinNumber">VIN Number</Label>
        <form.Field
          name="vinNumber"
          children={(field: any) => (
            <Input
              placeholder="Enter VIN Number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Unit Number */}
      <div className="space-y-2">
        <Label htmlFor="unitNumber">Unit Number</Label>
        <form.Field
          name="unitNumber"
          children={(field: any) => (
            <Input
              placeholder="Enter Unit Number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Samsara VIN */}
      <div className="space-y-2">
        <Label htmlFor="samsaraVin">Samsara VIN</Label>
        <form.Field
          name="samsaraVin"
          children={(field: any) => (
            <Input
              placeholder="Enter Samsara VIN"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Home Location */}
      <div className="space-y-2">
        <Label htmlFor="homeLocation">Home Location</Label>
        <form.Field
          name="homeLocation"
          children={(field: any) => (
            <Input
              placeholder="Enter Home Location"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Home Latitude */}
      <div className="space-y-2">
        <Label htmlFor="homeLatitude">Home Latitude</Label>
        <form.Field
          name="homeLatitude"
          children={(field: any) => (
            <Input
              placeholder="Enter Home Latitude"
              type="number"
              step="any"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Home Longitude */}
      <div className="space-y-2">
        <Label htmlFor="homeLongitude">Home Longitude</Label>
        <form.Field
          name="homeLongitude"
          children={(field: any) => (
            <Input
              placeholder="Enter Home Longitude"
              type="number"
              step="any"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* License Plate */}
      <div className="space-y-2">
        <Label htmlFor="licencePlate">License Plate</Label>
        <form.Field
          name="licencePlate"
          children={(field: any) => (
            <Input
              placeholder="Enter License Plate"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Dispatcher (Select) */}
      <div className="space-y-2">
        <Label htmlFor="dispatcher">Dispatcher</Label>
        <form.Field
          name="dispatcherId"
          children={(field: any) => (
            <Select value={field.state.value} onValueChange={field.handleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Dispatcher" />
              </SelectTrigger>
              <SelectContent>
                {dispatcherOptions.map((dispatcher) => (
                  <SelectItem key={dispatcher.value} value={dispatcher.value}>
                    {dispatcher.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  )
}

export default TruckFormFields
