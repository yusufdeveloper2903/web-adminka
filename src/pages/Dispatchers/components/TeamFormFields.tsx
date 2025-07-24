import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TeamFormFieldsProps {
  form: any // TanStack form instance
}

const TeamFormFields = ({ form }: TeamFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Team Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <form.Field
          name="name"
          children={(field: any) => (
            <Input
              placeholder="Enter Team Name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full"
            />
          )}
        />
      </div>
    </div>
  )
}

export default TeamFormFields
