import { Button } from "@/components/ui/button"
import useSystemHeader from "./hooks/useSystemHeader"
import useSystemForm from "./hooks/useSystemForm"
import SystemFormFields from "./components/SystemFormFields"

const SystemPage = () => {
  // Header Configuration Hook
  useSystemHeader()

  // Form hook
  const { form, resetForm, isSubmitting, isLoading } = useSystemForm()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 pl-8">
      <div className="max-w-4xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <SystemFormFields form={form} />

          {/* Form Actions */}
          <div className="flex justify-start space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SystemPage
