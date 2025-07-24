import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useTeamForm } from "../hooks/useTeamForm"
import TeamFormFields from "./TeamFormFields"
import type { ITeamResponse } from "@/types"

interface NewTeamFormProps {
  team?: ITeamResponse
  onClose?: () => void
}

const NewTeamForm = ({ team, onClose }: NewTeamFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { form, resetForm, isSubmitting, isEditing } = useTeamForm({ team })

  const handleClearForm = () => {
    resetForm()
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      closeDrawer()
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Team Form Fields */}
        <TeamFormFields form={form} />
        
        {/* Show validation errors */}
        {form.state.errors && form.state.errors.length > 0 && (
          <div className="text-red-500 text-sm">
            {form.state.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        {/* Bottom buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleClearForm}>
            Clear Form
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Team" : "Create Team"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewTeamForm
