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
            <div>
              <Input
                placeholder="Enter Team Name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={`w-full ${field.state.meta.errors.length > 0 ? "border-red-500" : ""}`}
              />
              {field.state.meta.errors.length > 0 && (
                <div className="mt-1 text-sm text-red-500">{field.state.meta.errors[0]}</div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default TeamFormFields
