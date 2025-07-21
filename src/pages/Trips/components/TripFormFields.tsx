import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateTimePicker } from "@/components/ui/date-picker"

// Mock data - keyinchalik backend dan keladi
const truckOptions = [
  { value: "626", label: "Truck 626" },
  { value: "627", label: "Truck 627" },
  { value: "628", label: "Truck 628" }
]

const dispatcherOptions = [
  { value: "1", label: "John Doe" },
  { value: "2", label: "Jane Smith" },
  { value: "3", label: "Mike Johnson" }
]

interface TripFormFieldsProps {
  form: any // TanStack form instance
  tripFormSchema: any // Zod schema with shape property
}

const TripFormFields = ({ form }: TripFormFieldsProps) => {
  return (
    <>
      {/* Top section - Truck, Dispatcher, Load Number */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="truck">Truck (Optional)</Label>
          <form.Field
            name="truckId"
            children={(field: any) => (
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Truck (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  {truckOptions.map((truck) => (
                    <SelectItem key={truck.value} value={truck.value}>
                      {truck.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatcher">Dispatcher (Optional)</Label>
          <form.Field
            name="dispatcherId"
            children={(field: any) => (
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Dispatcher (Optional)" />
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

        <div className="space-y-2">
          <Label htmlFor="loadNumber">Load Number (Optional)</Label>
          <form.Field
            name="loadNumber"
            children={(field: any) => (
              <Input
                placeholder="Load Number (Optional)"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          />
        </div>
      </div>

      {/* Date/time inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDateTime">Start Date/Time (Optional)</Label>
          <form.Field
            name="startDateTime"
            children={(field: any) => (
              <DateTimePicker
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select start date and time (Optional)"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDateTime">End Date/Time (Optional)</Label>
          <form.Field
            name="endDateTime"
            children={(field: any) => (
              <DateTimePicker
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select end date and time (Optional)"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startOdometer">Start Odometer (Optional)</Label>
          <form.Field
            name="startOdometer"
            children={(field: any) => (
              <Input
                placeholder="Start Odometer"
                type="number"
                step="0.1"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endOdometer">End Odometer (Optional)</Label>
          <form.Field
            name="endOdometer"
            children={(field: any) => (
              <Input
                placeholder="End Odometer"
                type="number"
                step="0.1"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          />
        </div>
      </div>
    </>
  )
}

export default TripFormFields
