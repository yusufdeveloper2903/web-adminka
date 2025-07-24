import { Button } from "@/components/ui/button"
import { useDrawerStore } from "@/store"
import { useDispatcherForm } from "../hooks/useDispatcherForm"
import DispatcherFormFields from "./DispatcherFormFields"
import type { IDispatcherResponse } from "@/types"

interface NewDispatcherFormProps {
  dispatcher?: IDispatcherResponse
  onClose?: () => void
}

const NewDispatcherForm = ({ dispatcher, onClose }: NewDispatcherFormProps) => {
  const { closeDrawer } = useDrawerStore()
  const { form, resetForm, isSubmitting, isEditing } = useDispatcherForm({ dispatcher })

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
        {/* Dispatcher Form Fields */}
        <DispatcherFormFields form={form} />

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
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Dispatcher"
                  : "Create Dispatcher"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewDispatcherForm
