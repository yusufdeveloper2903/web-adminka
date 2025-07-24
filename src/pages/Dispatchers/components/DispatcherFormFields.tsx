import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - keyinchalik backend dan keladi
const teamOptions = [
  { value: "1", label: "Team 1" },
  { value: "2", label: "Team 2" },
  { value: "3", label: "Team 3" },
  { value: "4", label: "Team 4" }
]

interface DispatcherFormFieldsProps {
  form: any // TanStack form instance
}

const DispatcherFormFields = ({ form }: DispatcherFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <form.Field
          name="firstName"
          children={(field: any) => (
            <Input
              placeholder="Enter First Name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <form.Field
          name="lastName"
          children={(field: any) => (
            <Input
              placeholder="Enter Last Name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>

      {/* Team (Select) */}
      <div className="space-y-2">
        <Label htmlFor="teamId">Team</Label>
        <form.Field
          name="teamId"
          children={(field: any) => (
            <Select value={field.state.value} onValueChange={field.handleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map((team) => (
                  <SelectItem key={team.value} value={team.value}>
                    {team.label}
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

export default DispatcherFormFields
