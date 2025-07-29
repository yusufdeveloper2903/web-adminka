import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useUserForm } from "../hooks/useUserForm"
import UserFormFields from "./UserFormFields"
import type { IUserResponse } from "@/types"

interface NewUserFormProps {
  user?: IUserResponse
  onClose?: () => void
}

const NewUserForm = ({ user, onClose }: NewUserFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { form, resetForm, isSubmitting, isEditing } = useUserForm({ user })

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
        {/* User Form Fields */}
        <UserFormFields form={form} />

        {/* Show validation errors */}
        {form.state.errors && form.state.errors.length > 0 && (
          <div className="text-sm text-red-500">
            {form.state.errors.map((error, index) => (
              <div key={index}>{typeof error === "string" ? error : "Validation error"}</div>
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
              {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update User" : "Create User"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewUserForm